import sys
import asyncio

# ---------------------------------------------------------------
# Windows psycopg3 compatibility fix:
# psycopg (psycopg3) used by langchain-postgres/pgvector does NOT
# support ProactorEventLoop (Windows default). Force SelectorEventLoop
# BEFORE any other imports so the entire process uses it.
# On Linux (Render production), this block is skipped automatically.
# ---------------------------------------------------------------
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

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
import wave
import struct
import os
from livekit import rtc

class AudioBufferMixer:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.buffer = []
        self.start_time = None
        self.next_sample_indices = {} # track_sid -> next_sample_index
        self._lock = asyncio.Lock()

    def start(self):
        self.start_time = asyncio.get_event_loop().time()

    async def add_audio(self, track_sid: str, pcm_bytes: bytes, timestamp: float):
        if self.start_time is None:
            return
            
        # Calculate target offset in samples based on timestamp
        offset_sec = timestamp - self.start_time
        if offset_sec < 0:
            offset_sec = 0
            
        target_idx = int(offset_sec * self.sample_rate)
        
        # Unpack 16-bit signed PCM bytes
        num_samples = len(pcm_bytes) // 2
        if num_samples == 0:
            return
            
        incoming_samples = struct.unpack(f"<{num_samples}h", pcm_bytes)
        
        async with self._lock:
            # Determine start index using jitter buffer logic
            last_idx = self.next_sample_indices.get(track_sid)
            if last_idx is None:
                start_idx = target_idx
            else:
                # If difference is small (less than 150ms), stitch contiguously to avoid gaps/pops
                diff = abs(target_idx - last_idx)
                max_jitter_samples = int(0.150 * self.sample_rate)
                if diff < max_jitter_samples:
                    start_idx = last_idx
                else:
                    start_idx = target_idx

            # Ensure our buffer is large enough
            end_idx = start_idx + num_samples
            if len(self.buffer) < end_idx:
                # Fill the gap with silence (zeros)
                self.buffer.extend([0] * (end_idx - len(self.buffer)))
                
            # Mix the samples
            for i in range(num_samples):
                idx = start_idx + i
                mixed = self.buffer[idx] + incoming_samples[i]
                # Clip to 16-bit signed integer limits
                self.buffer[idx] = max(-32768, min(32767, mixed))
                
            # Update the next sample index for this track
            self.next_sample_indices[track_sid] = end_idx

    async def save_to_wav(self, file_path: str):
        async with self._lock:
            if not self.buffer:
                return False
                
            # Pack samples to bytes
            pcm_bytes = struct.pack(f"<{len(self.buffer)}h", *self.buffer)
            
            # Write WAV file
            with wave.open(file_path, "wb") as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2) # 16-bit
                wav_file.setframerate(self.sample_rate)
                wav_file.writeframes(pcm_bytes)
            return True



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
            
            answer = await run_specialist_network(query, history, self.session_id)
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

    # Initialize Audio Buffer Mixer for session recording
    mixer = AudioBufferMixer(sample_rate=16000)
    mixer.start()
    active_streams = {}

    async def handle_track(track, sid):
        print(f"Starting recording stream for track: {sid}")
        try:
            stream = rtc.AudioStream(track, sample_rate=16000, num_channels=1)
            async for frame_event in stream:
                ts = asyncio.get_event_loop().time()
                await mixer.add_audio(sid, bytes(frame_event.frame.data), ts)
        except Exception as e:
            print(f"Error reading track {sid}: {e}")

    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            task = asyncio.create_task(handle_track(track, publication.sid))
            active_streams[publication.sid] = task

    @ctx.room.on("local_track_published")
    def on_local_track_published(publication, track):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            task = asyncio.create_task(handle_track(track, publication.sid))
            active_streams[publication.sid] = task

    # Check if there are already any remote tracks to subscribe to
    for p in ctx.room.remote_participants.values():
        for pub in p.track_publications.values():
            if pub.track and pub.track.kind == rtc.TrackKind.KIND_AUDIO and pub.sid not in active_streams:
                task = asyncio.create_task(handle_track(pub.track, pub.sid))
                active_streams[pub.sid] = task

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

    # ── Deduplication & fragment-aggregation state ─────────────────────────
    # Tracks item IDs already saved to prevent double-saves
    _saved_item_ids: set = set()
    # Accumulates rapid consecutive USER fragments (VAD splits one sentence
    # into multiple commits). After FRAGMENT_TIMEOUT seconds of silence,
    # the accumulated text is saved as ONE message.
    _fragment_buffer: list = []          # list of (text, timestamp) tuples
    _fragment_flush_task: asyncio.Task | None = None
    FRAGMENT_TIMEOUT = 2.0               # seconds to wait before flushing
    # ──────────────────────────────────────────────────────────────────────

    # -----------------------------
    # Save Messages
    # -----------------------------
    async def _flush_user_fragments():
        """Wait FRAGMENT_TIMEOUT seconds, then save accumulated USER fragments as one message."""
        nonlocal _fragment_flush_task
        await asyncio.sleep(FRAGMENT_TIMEOUT)
        if not _fragment_buffer:
            return
        merged_text = " ".join(t for t, _ in _fragment_buffer)
        _fragment_buffer.clear()
        _fragment_flush_task = None
        try:
            if not db.is_connected():
                await db.connect()
            await message_service.create_message(
                session_id=db_session.id,
                speaker="USER",
                content=merged_text,
            )
            await publish_event(
                "transcript_events",
                {"type": "transcript", "speaker": "USER", "text": merged_text, "sessionId": db_session.id},
            )
            await publish_event(
                "call_state_events",
                {"type": "state", "state": "thinking", "sessionId": db_session.id},
            )
            print(f"USER (merged): {merged_text}")
        except Exception as e:
            print(f"Fragment flush error: {e}")

    async def save_message(event):
        nonlocal _fragment_flush_task
        try:
            if not db.is_connected():
                await db.connect()

            item = getattr(event, "item", None)
            if not item:
                return

            # ── Deduplication: skip if we've already processed this item ──
            item_id = getattr(item, "id", None)
            if item_id and item_id in _saved_item_ids:
                print(f"Skipping duplicate item: {item_id}")
                return
            if item_id:
                _saved_item_ids.add(item_id)

            role = getattr(item, "role", None)
            if not role:
                return

            # Extract text content
            text = None
            if hasattr(item, "text_content") and item.text_content:
                text = item.text_content
            elif hasattr(item, "content"):
                content = item.content
                if isinstance(content, list):
                    text = " ".join(str(x) for x in content if str(x).strip())
                else:
                    text = str(content)

            if not text or not text.strip():
                return

            speaker = "USER" if role == "user" else "ASSISTANT"

            if speaker == "USER":
                # ── Fragment aggregation ──────────────────────────────────
                # Cancel any pending flush and accumulate this fragment.
                # A new flush timer starts; when it fires after FRAGMENT_TIMEOUT
                # seconds of silence, all fragments are merged into one message.
                if _fragment_flush_task and not _fragment_flush_task.done():
                    _fragment_flush_task.cancel()
                _fragment_buffer.append((text.strip(), asyncio.get_event_loop().time()))
                _fragment_flush_task = asyncio.create_task(_flush_user_fragments())
                # ─────────────────────────────────────────────────────────
            else:
                # ASSISTANT messages: flush any pending USER fragments first
                if _fragment_flush_task and not _fragment_flush_task.done():
                    _fragment_flush_task.cancel()
                    _fragment_flush_task = None
                if _fragment_buffer:
                    merged = " ".join(t for t, _ in _fragment_buffer)
                    _fragment_buffer.clear()
                    try:
                        await message_service.create_message(
                            session_id=db_session.id, speaker="USER", content=merged
                        )
                        await publish_event(
                            "transcript_events",
                            {"type": "transcript", "speaker": "USER", "text": merged, "sessionId": db_session.id},
                        )
                        print(f"USER (flushed before assistant): {merged}")
                    except Exception as e:
                        print(f"Pre-flush error: {e}")

                # Save ASSISTANT message normally
                await message_service.create_message(
                    session_id=db_session.id,
                    speaker="ASSISTANT",
                    content=text,
                )
                await publish_event(
                    "transcript_events",
                    {"type": "transcript", "speaker": "ASSISTANT", "text": text, "sessionId": db_session.id},
                )
                print(f"ASSISTANT: {text}")

        except Exception as e:
            print(f"Message save error: {e}")

    # -----------------------------
    # Conversation Event
    # -----------------------------
    @session.on("conversation_item_added")
    def on_conversation_item(event):
        asyncio.create_task(save_message(event))

    # -----------------------------
    # Handle Disconnect
    # -----------------------------
    async def close_db_session():
        try:
            print("ROOM DISCONNECTED")
            print("Closing session...")
            print("🔥 close_db_session called")
            
            # 1. Stop all active recording streams
            for task in active_streams.values():
                task.cancel()
            
            # 2. Save mixed audio to WAV
            os.makedirs("uploads", exist_ok=True)
            recording_filename = f"uploads/recording_{db_session.id}.wav"
            saved = await mixer.save_to_wav(recording_filename)
            
            if saved and os.path.exists(recording_filename):
                try:
                    from services.imagekit_service import upload_audio
                    from services.recording_service import recording_service
                    
                    print(f"Uploading recording {recording_filename} to ImageKit...")
                    file_url = await asyncio.to_thread(upload_audio, recording_filename)
                    print(f"Uploaded successfully: {file_url}")
                    
                    duration = None
                    if mixer.start_time:
                        duration = int(asyncio.get_event_loop().time() - mixer.start_time)
                        
                    await recording_service.create_recording(
                        session_id=db_session.id,
                        file_url=file_url,
                        duration=duration
                    )
                    print("Recording saved to database successfully!")
                    
                    # Clean up local file
                    os.remove(recording_filename)
                except Exception as e:
                    print(f"Failed to upload or save recording: {e}")
                    if os.path.exists(recording_filename):
                        os.remove(recording_filename)
            else:
                print("No audio data was recorded for this session.")

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