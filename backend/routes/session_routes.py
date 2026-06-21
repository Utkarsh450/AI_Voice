from fastapi import APIRouter
from pydantic import BaseModel
from services.session_service import (
    session_service
)
from services.message_service import (
    message_service
)
from services.summary_service import (
    summary_service
)

router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"]
)


@router.get("/")
async def get_sessions():
    return await (
        session_service
        .get_sessions()
    )


class SessionCreate(BaseModel):
    participant_identity: str = "test-user"
    persona: str = "default"


@router.post("/")
async def create_session(body: SessionCreate = None):
    identity = "test-user"
    persona_name = "default"
    if body:
        identity = body.participant_identity or "test-user"
        persona_name = body.persona or "default"

    session = (
        await session_service
        .create_session(
            room_name="Pending",
            participant_identity=identity,
            persona=persona_name,
        )
    )

    session = (
        await session_service
        .update_room_name(
            session.id,
            f"session-{session.id}"
        )
    )

    return session


@router.get("/{session_id}")
async def get_session(
    session_id: int
):
    return await (
        session_service
        .get_session(
            session_id
        )
    )


@router.get(
    "/{session_id}/messages"
)
async def get_messages(
    session_id: int
):
    return await (
        message_service
        .get_session_messages(
            session_id
        )
    )


@router.get(
    "/{session_id}/summary"
)
async def get_summary(
    session_id: int
):
    return await (
        summary_service
        .get_session_summary(
            session_id
        )
    )