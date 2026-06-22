# Production Deployment Guide: AI Voice Agent Call Center

This guide outlines the steps to deploy the AI Voice Call Center platform to production. We will use:
- **Render.com** for the backend (FastAPI Web Server + LiveKit Agent Background Worker).
- **Neon.tech** (or Supabase) for the PostgreSQL Database.
- **Upstash.com** (or Render Redis) for the Redis Event Broker.
- **LiveKit Cloud (Cloud Sandbox)** for the WebRTC audio server.
- **Vercel** for the Next.js Frontend.

---

## 1. Prerequisites (Cloud Accounts & API Keys)

Before deploying, create accounts and gather the following API keys:

1. **PostgreSQL Database:**
   - Create a free serverless database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
   - Get your Connection String (e.g. `postgresql://user:pass@host/dbname?sslmode=require`).
2. **Redis Instance:**
   - Create a free Redis instance on [Upstash](https://upstash.com) or [Aiven](https://aiven.io).
   - Get the Redis Connection URL (e.g. `rediss://default:password@host:port`).
3. **LiveKit Cloud:**
   - Sign up at [LiveKit Cloud](https://livekit.io) and create a Project.
   - Get your **LiveKit Server URL** (e.g., `wss://yourproject.livekit.cloud`).
   - Generate a **LiveKit API Key** and **API Secret** in the project settings.
4. **OpenAI API Key:**
   - Get an API key from [platform.openai.com](https://platform.openai.com) (used for Whisper STT, text embeddings, and TTS).
5. **Groq API Key:**
   - Get an API key from [console.groq.com](https://console.groq.com) (used for high-speed LLM routing and persona answering).

---

## 2. Deploying the Backend on Render.com

The project is pre-configured with a `render.yaml` Blueprint file. Render will automatically read this file and set up both the FastAPI Web Server and the LiveKit Background Worker together.

### Steps:
1. Push your project code to a private GitHub repository.
2. Log in to [Render.com](https://render.com).
3. Click **New** (top right) and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will detect the `render.yaml` file and show two services to create:
   - **`ai-voice-api`** (Web Service running FastAPI)
   - **`ai-voice-agent`** (Worker Service running the LiveKit Agent process)
6. You will be prompted to enter the values for the following environment variables:

| Environment Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection string (from Neon/Supabase) |
| `REDIS_URL` | Redis Connection string (from Upstash/Aiven) |
| `LIVEKIT_URL` | LiveKit Server URL (`wss://...`) |
| `LIVEKIT_API_KEY` | LiveKit Project API Key |
| `LIVEKIT_API_SECRET` | LiveKit Project API Secret |
| `OPENAI_API_KEY` | OpenAI API Key |
| `GROQ_API_KEY` | Groq API Key |

7. Click **Apply**. Render will automatically build the Docker images and deploy both services!

---

## 3. Database Schema Push

Once the database and backend are deployed, push the Prisma schema to compile the PostgreSQL tables:

Run the following command locally in your terminal (make sure your `.env` contains the production `DATABASE_URL`):
```bash
npx prisma db push --schema=backend/prisma/schema.prisma
```
This will set up the `Session`, `Message`, `Summary`, `Document`, `Persona`, and `UserMemory` tables in your production PostgreSQL database.

---

## 4. Deploying the Frontend on Vercel

The Next.js frontend can be deployed to Vercel in seconds.

### Steps:
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** of the project to **`frontend`** (since your Next.js app sits in the `frontend` folder).
5. Add the following **Environment Variable**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://ai-voice-api.onrender.com` | The public URL of your Render FastAPI Web Service |

6. Click **Deploy**. Vercel will build and launch your call center dashboard!

---

## 5. Connecting LiveKit Webhooks (For Recording / Sessions)

To sync LiveKit events (like participants leaving the room to generate call summaries) in production, you must add the webhook URL to your LiveKit dashboard:

1. Log in to your **LiveKit Cloud Dashboard**.
2. Go to **Settings** -> **Webhooks**.
3. Add a new Webhook pointing to:
   `https://your-render-web-service-url.onrender.com/webhook/livekit`
4. Select the events you want to listen to (e.g. `room_started`, `room_finished`, `participant_joined`, `participant_left`).

Your voice agent call center is now **100% deployed and production-ready**!
