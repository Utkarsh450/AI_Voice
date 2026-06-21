from typing import TypedDict, Annotated, Sequence, Dict, Any, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from prisma.models import Persona
import os

from services.rag_service import rag_service

# Define the State
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], "The conversation history"]
    next_agent: str

async def supervisor_node(state: AgentState, personas: List[Persona]) -> Dict[str, Any]:
    """
    The Supervisor reads the query and routes it to the most relevant Persona.
    """
    llm = ChatGroq(model="llama3-8b-8192", temperature=0)
    
    # Build routing options dynamically from DB Personas
    system_prompt = "You are a Supervisor Agent. Your job is to route the conversation to the most appropriate specialized worker agent based on the user's latest message.\n\n"
    system_prompt += "Available Agents:\n"
    for p in personas:
        system_prompt += f"- {p.name}: {p.description}\n"
    system_prompt += "- FINISH: If the user's query has been fully answered or no agent is needed, route here.\n\n"
    system_prompt += "Respond ONLY with the exact name of the agent to route to, or FINISH."
    
    messages = [SystemMessage(content=system_prompt)] + list(state["messages"])
    response = await llm.ainvoke(messages)
    
    next_node = response.content.strip()
    
    # Fallback to general if invalid
    valid_nodes = [p.name for p in personas] + ["FINISH"]
    if next_node not in valid_nodes:
        if valid_nodes:
            next_node = valid_nodes[0]
        else:
            next_node = "FINISH"
            
    return {"next_agent": next_node}

def create_worker_node(persona: Persona):
    """
    Creates a LangGraph node function for a specific Persona.
    """
    async def worker_node(state: AgentState) -> Dict[str, Any]:
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)
        
        # Build prompt using the Persona's system prompt
        system_prompt = persona.systemPrompt
        
        # If this is a Document RAG agent, inject context
        # (A simple heuristic: if description mentions RAG/Documents, we do a search)
        context = ""
        last_message = state["messages"][-1].content
        if "document" in persona.description.lower() or "rag" in persona.description.lower():
            try:
                results = await rag_service.search(last_message)
                docs = [doc.page_content for doc in results]
                context = "\n\nRelevant Document Context:\n" + "\n".join(docs)
            except Exception as e:
                context = f"\n\n[Error retrieving documents: {str(e)}]"
                
        messages = [SystemMessage(content=system_prompt + context)] + list(state["messages"])
        response = await llm.ainvoke(messages)
        
        return {
            "messages": [response]
        }
    return worker_node

async def run_specialist_network(query: str, chat_history: List[Dict[str, str]] = None) -> str:
    """
    Executes the multi-agent graph for a given query.
    """
    from database.prisma_client import db
    
    # Fetch all active personas
    personas = await db.persona.find_many()
    
    if not personas:
        return "I'm sorry, my specialist network has not been configured with any Personas yet."
        
    # Build graph dynamically
    workflow = StateGraph(AgentState)
    
    # Add Supervisor
    workflow.add_node("supervisor", lambda state: supervisor_node(state, personas))
    
    # Add Worker Nodes
    for p in personas:
        workflow.add_node(p.name, create_worker_node(p))
        
    # Add Routing Logic
    def router(state: AgentState) -> str:
        next_agent = state.get("next_agent", "FINISH")
        if next_agent == "FINISH":
            return END
        return next_agent

    # Set Edges
    workflow.set_entry_point("supervisor")
    workflow.add_conditional_edges("supervisor", router)
    
    # Workers always return to END for this single-turn tool invocation
    for p in personas:
        workflow.add_edge(p.name, END)
        
    app = workflow.compile()
    
    # Build LangChain messages from history
    lc_messages = []
    if chat_history:
        for msg in chat_history:
            if msg["role"] == "user":
                lc_messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                # Assuming assistant messages as System or AI, but for graph we can use System or skip
                pass
                
    lc_messages.append(HumanMessage(content=query))
    
    # Run Graph
    final_state = await app.ainvoke({
        "messages": lc_messages,
        "next_agent": ""
    })
    
    # Extract final response from the last message
    last_msg = final_state["messages"][-1]
    return last_msg.content
