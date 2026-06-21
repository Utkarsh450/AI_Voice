import os
from fastapi import APIRouter
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from livekit import api
from pydantic import BaseModel


class DispatchRequest(
    BaseModel
):
    sessionId: int

from services.session_service import session_service

load_dotenv()

router = APIRouter(
    prefix="/livekit",
    tags=["LiveKit"]
)


@router.get(
    "/token/{session_id}"
)
async def get_token(
    session_id: int
):
    db_session = await session_service.get_session(session_id)
    identity = db_session.participantIdentity if (db_session and db_session.participantIdentity) else "test-user"

    token = (
        api.AccessToken(
            os.getenv("LIVEKIT_API_KEY"),
            os.getenv("LIVEKIT_API_SECRET")
        )
        .with_identity(identity)
        .with_name(identity)
        .with_grants(
            api.VideoGrants(
                room_join=True,
               
                room=f"session-{session_id}"
            )
        )
        .to_jwt()
    )

    return {
    "token": token,
    "room":
    f"session-{session_id}",
    "url":
    os.getenv(
        "LIVEKIT_URL"
    )
}
@router.post(
    "/dispatch"
)
async def dispatch_agent(
    body:
    DispatchRequest
):

    lkapi = api.LiveKitAPI(
        url=os.getenv("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET"),
    )

    await lkapi.agent_dispatch.create_dispatch(
        api.CreateAgentDispatchRequest(
            room=f"session-{body.sessionId}",
            agent_name="voice-agent",
        )
    )

    return {"message": "Agent dispatched"}