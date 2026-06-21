from dotenv import load_dotenv
load_dotenv()

from database.prisma_client import db
# pyrefly: ignore [missing-import]
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
# pyrefly: ignore [missing-import]
from livekit.plugins import openai
from services.session_service import session_service
from services.message_service import message_service
from services.user_memory_service import (
    user_memory_service,
)

from utils.global_memory_generator import (
    generate_global_memory,
)
from services.summary_service import summary_service
from utils.summary_generator import generate_summary
from utils.summary_generator import parse_summary

from services.event_publisher import (
    publish_event,
)

import asyncio


class Assistant(Agent):
    def __init__(
        self,
        memory_context: str = "",
        session_id: int = 0
    ):
        self.session_id = session_id
        super().__init__(
            instructions=f"""
You are the Receptionist AI for our platform.

The following information is factual memory about the user.

{memory_context}

Rules:
- Remember previous conversations.
- Remember user preferences.
- Remember personal facts.
- Use this memory naturally.

Speak naturally.
Keep responses short.

IMPORTANT TOOL USAGE (MULTI-AGENT ROUTING):
If the user asks ANY complex question, requires domain expertise, asks about uploaded documents, HR policies, billing, technical support, or any topic that requires a specialized Persona, YOU MUST USE the 'consult_specialist_network' function.
Do NOT try to answer complex or domain-specific questions yourself. Always route them to the specialist network.

CRITICAL LATENCY RULE: When the 'consult_specialist_network' function returns an answer, you MUST speak that exact answer verbatim to the user IMMEDIATELY. Do not add introductory words like "The specialist says...". Do not summarize. Just output the exact answer so it can be spoken to the user as fast as possible.
"""
        )

    @llm.function_tool(description="Consult the network of specialized AI Agents to answer complex queries or document searches.")
    async def consult_specialist_network(
        self,
        query: str,
    ):
        """Send the user's query to the LangGraph Supervisor to be routed to a specialized Persona."""
        print(f"Routing to specialist network: {query}")
        try:
            from services.multi_agent_service import run_specialist_network
            from services.message_service import message_service
            
            # Fetch recent chat history for context
            messages = await message_service.get_session_messages(self.session_id)
            history = [{"role": m.speaker.lower(), "content": m.content} for m in messages[-5:]]
            
            answer = await run_specialist_network(query, history)
            return f"Specialist Agent Answer: {answer}"
        except Exception as e:
            print(f"Error in specialist network: {e}")
            return "Sorry, the specialist network is currently unavailable."


async def entrypoint(ctx: JobContext):
    # -----------------------------
    # Connect Prisma
    # -----------------------------
    if not db.is_connected():
        try:
            await db.connect()
            print("DB Connected")
        except Exception as e:
            print(f"Failed to connect to DB: {e}")
    else:
        print("DB Already Connected")

    print(f"Joining room: {ctx.room.name}")

    # -----------------------------
    # Connect to LiveKit Room
    # -----------------------------
    await ctx.connect()
    print("Room connected")

    # -----------------------------
    # Get participant identity
    # -----------------------------
    participant_identity = "unknown"

    participants = list(
        ctx.room.remote_participants.values()
    )

    if participants:
        participant_identity = (
            participants[0].identity
        )

    # -----------------------------
    # Create DB Session
    # -----------------------------
    room_name = ctx.room.name

    if not room_name.startswith(
        "session-"
    ):
        raise Exception(
            f"Invalid room: {room_name}"
        )

    session_id = int(
        room_name.replace(
            "session-",
            ""
        )
    )

    db_session = (
        await session_service
        .get_session(
            session_id
        )
    )
    if not db_session:
        raise Exception(
            f"Session {session_id} not found"
        )
    summary = (
        await summary_service
        .get_session_summary(
            db_session.id
        )

    
    )
    user_memory = (
        await user_memory_service
        .get_memory(
            participant_identity
        )
    )

    global_memory = ""

    if user_memory:
        global_memory = (
            user_memory.memory
        )

    print(
        "GLOBAL MEMORY:",
        global_memory
    )

    memory_context = ""

    if summary:
        memory_context = f"""
        Previous Conversation Summary:
        {summary.summary}

        User Facts:
        {summary.userFacts}

        Open Items:
        {summary.openItems}

        Action Items:
        {summary.actionItems}
        """
    print(
    "SUMMARY OBJECT:",
    summary

    )
    print(
        "MEMORY:",
        memory_context
    )

    print(
    f"Resuming session:{db_session.id}")

    disconnect_event = asyncio.Event()

    # -----------------------------
    # Create Voice Agent
    # -----------------------------
    session = AgentSession(
        stt=openai.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(
            model="tts-1",
            voice="alloy",
        ),
        preemptive_generation=True,
    )
            

    # -----------------------------
    # Save Messages
    # -----------------------------
    async def save_message(event):
        try:
            if not db.is_connected():
                await db.connect()
            print("EVENT:", event)

            item = getattr(
                event,
                "item",
                None
            )

            if not item:
                return

            print("ITEM:", item)
            print("ITEM DIR:", dir(item))

            role = getattr(
                item,
                "role",
                None
            )

            if not role:
                return

            text = None

            if hasattr(item, "text_content"):
                text = item.text_content

            elif hasattr(item, "content"):
                content = item.content

                if isinstance(content, list):
                    text = " ".join(
                        str(x)
                        for x in content
                    )
                else:
                    text = str(content)

            if not text:
                return

            speaker = (
                "USER"
                if role == "user"
                else "ASSISTANT"
            )

            await message_service.create_message(
                session_id=db_session.id,
                speaker=speaker,
                content=text,
            )

            await publish_event(
                "transcript_events",
                {
                    "type": "transcript",
                    "speaker": speaker,
                    "text": text,
                    "sessionId": db_session.id,
                },
            )
            print("STATE SENT:",speaker)
            print("TRANSCRIPT SENT:", text)

            if speaker == "USER":
                await publish_event(
                    "call_state_events",
                    {
                        "type": "state",
                        "state": "thinking",
                        "sessionId": db_session.id,
                    },
                )
            print(
                f"{speaker}: {text}"
            )

        except Exception as e:
            print(
                f"Message save error: {e}"
            )

    # -----------------------------
    # Conversation Event
    # -----------------------------
    @session.on("conversation_item_added")
    def on_conversation_item(event):
        asyncio.create_task(
            save_message(event)
        )

    # -----------------------------
    # Handle Disconnect
    # -----------------------------
    async def close_db_session():
        try:
            print("ROOM DISCONNECTED")
            print("Closing session...")
            print("🔥 close_db_session called")
            print("1")
            messages = (
             
                await message_service
                .get_session_messages(
                    db_session.id
                )
            )
            print(f"Messages found: {len(messages)}")
            print("Generating summary...")
            print("2")
            summary_text = (
                await generate_summary(
                    messages
                )
            )

            parsed = parse_summary(
                summary_text
            )

            await summary_service.create_summary(
                session_id=db_session.id,
                summary=parsed["summary"],
                user_facts=parsed["user_facts"],
                open_items=parsed["open_items"],
                action_items=parsed["action_items"],
            )
            memory = (
                await user_memory_service
                .get_memory(
                    participant_identity
                )
            )

            previous_memory = ""

            if memory:
                previous_memory = (
                    memory.memory
                )

            updated_memory = (
                await generate_global_memory(
                    previous_memory,
                    parsed["summary"],
                )
            )

            await user_memory_service.upsert_memory(
                participant_identity,
                updated_memory,
            )

            print(
                "GLOBAL MEMORY SAVED"
            )
            print("4")
            print("Summary saved")
            updated = (
                await session_service.end_session(
                    db_session.id
                )
            )

            if updated:
                print(
                    f"Session closed: {updated.id}"
                )

        except Exception as e:
            print(
                f"Error closing session: {e}"
            )

    @ctx.room.on("disconnected")
    def on_disconnect(*args):
        async def handle():
            await close_db_session()
            disconnect_event.set()
        asyncio.create_task(handle())

    # -----------------------------
    # Start Voice Agent
    # -----------------------------
    combined_memory = f"""
    SESSION MEMORY
    ----------------
    {memory_context}

    GLOBAL USER MEMORY
    ----------------
    {global_memory}
    """

    print(
        "COMBINED MEMORY:\n",
        combined_memory
    )
    await session.start(
    agent=Assistant(
        combined_memory,
        db_session.id
    ),
    room=ctx.room,
)

    if not summary:
        await session.generate_reply(
            instructions="""
            Greet the user and ask
            how you can help.
            """
        )

    print("Voice agent started!")

    # -----------------------------
    # Keep worker alive
    # -----------------------------
    try:
        await disconnect_event.wait()
    finally:
        if db.is_connected():
            await db.disconnect()
            print("DB Disconnected")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="voice-agent",
        )
    
    )