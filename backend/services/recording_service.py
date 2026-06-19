from database.prisma_client import db


class RecordingService:
    async def create_recording(
        self,
        session_id: int,
        file_url: str,
        duration: int | None = None,
    ):
        return (
            await db.recording.create(
                data={
                    "sessionId":
                    session_id,
                    "fileUrl":
                    file_url,
                    "duration":
                    duration,
                }
            )
        )

    async def get_recording(
        self,
        session_id: int,
    ):
        return (
            await db.recording.find_unique(
                where={
                    "sessionId":
                    session_id
                }
            )
        )


recording_service = (
    RecordingService()
)