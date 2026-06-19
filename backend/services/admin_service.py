import os
from collections import defaultdict
from datetime import datetime, timezone

from groq import AsyncGroq
from livekit import api

from database.prisma_client import db

groq_client = AsyncGroq(
    api_key=os.getenv("GROQ_API_KEY")
)


class AdminService:

    # ==========================
    # Dashboard Stats
    # ==========================

    async def get_total_calls(self):
        return await db.session.count()

    async def get_total_users(self):
        memories = (
            await db.usermemory.find_many()
        )
        return len(memories)

    async def get_total_documents(self):
        return await db.document.count()

    async def get_total_personas(self):
        # Future:
        # return await db.persona.count()
        return 1

    async def get_today_calls(self):
        today = (
            datetime.now(
                timezone.utc
            ).date()
        )

        sessions = (
            await db.session.find_many()
        )

        count = 0

        for session in sessions:
            if (
                session.startedAt.date()
                == today
            ):
                count += 1

        return count

    async def get_avg_duration(self):
        sessions = (
            await db.session.find_many(
                where={
                    "durationSeconds": {
                        "not": None
                    }
                }
            )
        )

        if not sessions:
            return 0

        total = sum(
            s.durationSeconds
            for s in sessions
        )

        return int(
            total /
            len(sessions)
        )

    async def get_completed_calls(
        self,
    ):
        return await db.session.count(
            where={
                "status":
                "COMPLETED"
            }
        )

    async def get_success_rate(self):
        total = (
            await db.session.count()
        )

        if total == 0:
            return 0

        completed = (
            await db.session.count(
                where={
                    "status":
                    "COMPLETED"
                }
            )
        )

        return round(
            (
                completed /
                total
            ) * 100
        )

    # ==========================
    # Charts
    # ==========================

    async def get_calls_trend(
        self,
    ):
        sessions = (
            await db.session.find_many()
        )

        days = {
            "Mon": 0,
            "Tue": 0,
            "Wed": 0,
            "Thu": 0,
            "Fri": 0,
            "Sat": 0,
            "Sun": 0,
        }

        for session in sessions:
            day = (
                session.startedAt
                .strftime("%a")
            )

            days[day] += 1

        return [
            {
                "day": day,
                "calls": count,
            }
            for day, count
            in days.items()
        ]

    async def get_persona_distribution(
        self,
    ):
        sessions = (
            await db.session.find_many()
        )

        personas = defaultdict(
            int
        )

        for session in sessions:
            name = (
                session.persona
                or "default"
            )

            personas[name] += 1

        return [
            {
                "name": name,
                "value": value,
            }
            for name, value
            in personas.items()
        ]

    # ==========================
    # Tables
    # ==========================

    async def get_recent_sessions(
        self,
    ):
        return await (
            db.session.find_many(
                order={
                    "startedAt":
                    "desc"
                },
                take=10,
            )
        )

    async def get_top_users(
        self,
    ):
        sessions = (
            await db.session.find_many()
        )

        users = defaultdict(
            int
        )

        for session in sessions:
            users[
                session.participantIdentity
            ] += 1

        sorted_users = sorted(
            users.items(),
            key=lambda x: x[1],
            reverse=True,
        )

        return [
            {
                "userId": user,
                "calls": calls,
            }
            for user, calls
            in sorted_users[:5]
        ]

    # ==========================
    # Users
    # ==========================

    async def get_users(
        self,
    ):
        memories = (
            await db.usermemory.find_many()
        )

        users = []

        for memory in memories:

            total_calls = (
                await db.session.count(
                    where={
                        "participantIdentity":
                        memory.userId
                    }
                )
            )

            latest = (
                await db.session.find_first(
                    where={
                        "participantIdentity":
                        memory.userId
                    },
                    order={
                        "startedAt":
                        "desc"
                    }
                )
            )

            users.append(
                {
                    "userId":
                    memory.userId,

                    "memory":
                    memory.memory,

                    "totalCalls":
                    total_calls,

                    "lastActive":
                    (
                        latest.startedAt
                        if latest
                        else None
                    ),
                }
            )

        return users

    async def get_user(
        self,
        user_id: str,
    ):
        memory = (
            await db.usermemory.find_unique(
                where={
                    "userId":
                    user_id
                }
            )
        )

        sessions = (
            await db.session.find_many(
                where={
                    "participantIdentity":
                    user_id
                },
                order={
                    "startedAt":
                    "desc"
                }
            )
        )

        return {
            "userId":
            user_id,

            "memory":
            (
                memory.memory
                if memory
                else ""
            ),

            "sessions":
            sessions,
        }

    # ==========================
    # Monitoring
    # ==========================

    async def postgres_status(
        self,
    ):
        try:
            await db.session.count()
            return True

        except:
            return False

    async def livekit_status(
        self,
    ):
        try:
            lk = api.LiveKitAPI(
                url=os.getenv(
                    "LIVEKIT_URL"
                ),
                api_key=os.getenv(
                    "LIVEKIT_API_KEY"
                ),
                api_secret=os.getenv(
                    "LIVEKIT_API_SECRET"
                ),
            )

            await lk.room.list_rooms()
            await lk.aclose()

            return True

        except:
            return False

    async def groq_status(
        self,
    ):
        try:
            await (
                groq_client
                .chat
                .completions
                .create(
                    model=
                    "llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role":
                            "user",
                            "content":
                            "hello"
                        }
                    ],
                    max_tokens=1,
                )
            )

            return True

        except:
            return False


admin_service = AdminService()