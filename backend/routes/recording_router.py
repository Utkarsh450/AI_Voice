from fastapi import APIRouter
from services.recording_service import (
    recording_service,
)

router = APIRouter(
    prefix="/recordings",
    tags=["Recordings"],
)


@router.get(
    "/session/{session_id}"
)
async def get_recording(
    session_id: int,
):
    return await (
        recording_service
        .get_recording(
            session_id
        )
    )