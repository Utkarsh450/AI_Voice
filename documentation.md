# Comprehensive Technical Documentation: AI Voice Agent

This document provides a highly technical, deep-dive explanation of every single service, module, and data flow within the AI Voice Agent platform. 

---

## 1. System Topology & Data Flow

The platform relies on a sophisticated hybrid architecture:
1. **Frontend (Next.js)**: Runs locally on port `3000` (or served statically). It handles the user interface, LiveKit React components for microphone access, and WebSockets for real-time transcript updates.
2. **FastAPI Backend (`main.py`)**: Runs on port `8000`. It serves as the primary REST API, WebSocket server, and static file host.
3. **Voice Agent Node (`agent.py`)**: Runs continuously as a separate background process. It connects to the LiveKit Cloud via WebRTC, interfaces with OpenAI/Groq LLMs, processes raw PCM audio streams, and executes Python code asynchronously.
4. **PostgreSQL (Neon/Prisma)**: The core relational database storing sessions, messages, global memory, custom personas, and settings.
5. **Redis Pub/Sub**: The high-speed message broker bridging the gap between the `agent.py` process and the `main.py` FastAPI server.
6. **ChromaDB / pgvector**: The local/remote vector database used for Retrieval-Augmented Generation (RAG).

---

## 2. Core Operational Services (`backend/services/`)

Every piece of business logic is isolated into a specific service file interacting with Prisma models.

### 🎙️ The Voice Engine & LiveKit Connectivity
- **`livekit_service.py`**: Interacts with the `livekit-server-sdk-python`. When the frontend requests a room, this service securely generates a `VideoGrant` allowing the user to join a specific `room_name` (e.g., `session-123`). It signs this with the `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`.
- **`agent.py` (The Heart)**: 
  - Subscribes to the LiveKit WebRTC audio stream.
  - Intercepts raw 16-bit PCM audio chunks using a custom `AudioBufferMixer`. The mixer uses jitter-buffer logic to stitch human audio and AI audio into a perfectly synchronized `.wav` file in real-time.
  - Utilizes OpenAI's Realtime STT (Speech-to-Text) and TTS (Text-to-Speech) pipelines.
  - Implements an `@llm.function_tool` called `consult_specialist_network` which allows the generic Voice Assistant to seamlessly route difficult technical questions to specialized LangGraph agents.

### 💾 Session & Message Tracking
- **`session_service.py`**: Interacts with the `Session` Prisma model. Creates new call instances, tracks the active `participantIdentity`, and gracefully updates the `endedAt` timestamp and total `durationSeconds` when the WebRTC room disconnects.
- **`message_service.py`**: As `agent.py` decodes speech into text, it pushes text strings here. The service deduplicates overlapping speech fragments (VAD splits), merges them based on a 2.0-second silence timeout, and saves them to the `Message` Prisma table tagged with `speaker` ("USER" or "ASSISTANT").

### 🧠 Intelligence, Memory, & Summarization
- **`user_memory_service.py`**: Manages the `UserMemory` Prisma model. It acts as the Long-Term Global Context. Before a call starts, `agent.py` fetches this string to prime the AI with historical user preferences.
- **`summary_service.py`**: Triggered the second a call ends. It pulls the entire transcript from `message_service.py` and feeds it into an LLM. It parses a JSON response to extract a general `summary`, `userFacts` (e.g., "User likes concise answers"), `openItems`, and `actionItems`. This output is then appended back into the `UserMemory`.

### 🔀 LangGraph Multi-Agent Routing (`multi_agent_service.py`)
This is the most advanced logic node. When `agent.py` triggers `consult_specialist_network`, this service spins up a directed state graph:
1. **The Supervisor Node**: Powered by Groq's `llama-3.1-8b-instant`. It reads the user's query and the list of available `Personas` from the database. It strictly decides which Persona (e.g., "HR Expert", "Tech Support") should handle the question.
2. **The Worker Node**: Powered by Groq's `llama-3.3-70b-versatile`. Once routed to a specific Persona, this node dynamically generates a LangChain prompt combining the Persona's custom `systemPrompt` and any relevant documents retrieved by the RAG engine.
3. **Database Sync**: The service instantly updates the active `Session` row in PostgreSQL with the name of the new Persona and publishes a WebSocket event so the React UI updates the visual avatar to reflect the persona change.

### 📚 RAG Knowledge Engine (`rag_service.py`)
- Responsible for ingesting PDF and TXT files.
- Splits text into semantic chunks, generates vector embeddings using an LLM embedding model, and pushes them into the Vector Store.
- When the `multi_agent_service.py` worker node boots up, it queries this service. `rag_service.search` performs a cosine-similarity search against the user's query, returning the top 4 most relevant text chunks to ground the AI's response in factual documents.

### 📡 Real-Time Distributed Messaging
Because `agent.py` (which processes the AI) and `main.py` (which serves the user UI) run on completely separate threads/processes, they must synchronize via Redis.
- **`redis_service.py`**: Initializes the global `redis.asyncio` connection pool.
- **`event_publisher.py`**: Used by `agent.py` to blindly fire JSON payloads into Redis PubSub channels (`transcript_events`, `call_state_events`).
- **`event_subscriber.py`**: A continuous background loop running inside FastAPI. It `listens()` to the Redis channels. 
  - *Engineering Note*: Upstash Serverless Redis actively terminates idle connections after 5 seconds. To prevent the subscriber from crashing continuously, this service spawns an asynchronous `ping_task` that fires `await pubsub.ping()` every 3 seconds to trick the load balancer into keeping the TCP socket open indefinitely.
- **`websocket_manager.py`**: When `event_subscriber.py` catches a Redis message, it passes it to the `ConnectionManager`. This manager holds active WebSocket objects for connected users. It iterates through them and calls `await websocket.send_json(data)`, forcing the React frontend to instantly display the live transcript text.

### 📼 Audio Storage & Retrieval
- **`imagekit_service.py`**: When a session closes, `agent.py` finalizes the `recording.wav` file. This service takes that file path, calls the ImageKit API with a secure authentication signature, and streams the binary data to their global CDN.
- **`recording_service.py`**: Takes the returned CDN public URL and inserts it into the `Recording` Prisma table, linking it via a foreign key to the original `Session`. This allows the frontend to query historical recordings and play them back in the browser.

---

## 3. Database Schema Mapping (Prisma)

Every feature maps directly to the `schema.prisma` architecture:
- **`Session`**: The foundational table linking a room name, user identity, duration, and the active Persona.
- **`Message`**: Belongs to a `Session`. Stores the raw chat transcript.
- **`Summary`**: 1-to-1 relationship with a `Session`. Contains structured LLM-derived insights.
- **`UserMemory`**: Tied to a `userId`. Acts as the global context window across infinite sessions.
- **`Recording`**: 1-to-1 relationship with `Session`. Stores the ImageKit URL.
- **`Document`**: Tracks uploaded RAG files, their paths, and whether they successfully vectorized (`processed: Boolean`).
- **`Persona`**: Defines custom AI agents dynamically, storing their names and custom `systemPrompt` text.

---

## 4. Frontend Interactions (`Next.js`)

The React UI (`app/sessions/[id]/page.tsx`) acts as the presentation layer for all these backend systems:
1. It requests a LiveKit token from `livekit_service.py`.
2. It mounts the `@livekit/components-react` `<LiveKitRoom>` provider to establish the WebRTC microphone tunnel to `agent.py`.
3. It simultaneously opens a raw WebSocket connection to `ws://localhost:8000/ws/{session_id}`.
4. As the AI speaks, the WebSocket pushes `REDIS EVENT` JSON payloads down to the browser.
5. The React state dynamically appends these new transcripts to the chat window, creating a native, zero-latency "live typing" effect matching the AI's vocal output.
