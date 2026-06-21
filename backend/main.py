from fastapi import FastAPI
from database.prisma_client import db
from api.health import router as health_router
from api.websocket_api import router as websocket_router
from api.livekit_api import router as livekit_router

from routes.session_routes import (
    router as session_router
)

from fastapi.middleware.cors import CORSMiddleware
import asyncio

from routes.recording_router import (
    router as recording_router
)

from services.event_subscriber import (
    start_subscriber,
)
from routes.admin_routes import (
    router as admin_router
)
from services.settings_service import init_default_settings

app = FastAPI(
    title="AI Voice Call Center API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    print("Connecting...")
    await db.connect()
    print("Connected to DB")
    await init_default_settings()
    asyncio.create_task(
        start_subscriber()
    )


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

    print("disconnected to db")


app.include_router(health_router)
app.include_router(session_router)


app.include_router(websocket_router)

app.include_router(livekit_router)
app.include_router(
    recording_router

)
app.include_router(
    admin_router
)