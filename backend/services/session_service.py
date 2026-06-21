from datetime import datetime, timezone
from database.prisma_client import db


class SessionService:

    async def create_session(
        self,
        room_name: str,
        participant_identity: str,
        persona: str = "default",
    ):
        session = await db.session.create(
            data={
                "roomName": room_name,
                "participantIdentity": participant_identity,
                "status": "ACTIVE",
                "persona": persona,
            }
        )

        return session

    async def end_session(
        self,
        session_id: int,
    ):
        session = await db.session.find_unique(
            where={
                "id": session_id
            }
        )

        if not session:
            return None

        ended_at = datetime.now(timezone.utc)
        started_at = session.startedAt

        # Normalize datetimes to naive UTC for safe offset-naive subtraction
        started_at_naive = started_at.astimezone(timezone.utc).replace(tzinfo=None) if started_at.tzinfo is not None else started_at
        ended_at_naive = ended_at.astimezone(timezone.utc).replace(tzinfo=None)

        duration = int((ended_at_naive - started_at_naive).total_seconds())

        updated = await db.session.update(
            where={
                "id": session_id
            },
            data={
                "status": "COMPLETED",
                "endedAt": ended_at,
                "durationSeconds": duration,
            }
        )

        return updated
    
    async def get_sessions(self):
        return await db.session.find_many(
            order={
                "startedAt": "desc"
            }
        )


    async def get_session(
        self,
        session_id: int
    ):
        return await db.session.find_unique(
            where={
                "id": session_id
            }
        )
    async def update_room_name(
        self,
        session_id: int,
        room_name: str,
    ):
        return await db.session.update(
            where={
                "id": session_id
            },
            data={
                "roomName": room_name
            }
        )


session_service = SessionService()