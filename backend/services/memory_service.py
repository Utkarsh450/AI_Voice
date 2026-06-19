from database.prisma_client import db


class MemoryService:

    async def get_memory(
        self,
        user_id: str,
    ):
        return await db.usermemory.find_unique(
            where={
                "userId": user_id
            }
        )

    async def save_memory(
        self,
        user_id: str,
        memory: str,
    ):
        return await db.usermemory.upsert(
            where={
                "userId": user_id
            },
            data={
                "create": {
                    "userId": user_id,
                    "memory": memory,
                },
                "update": {
                    "memory": memory,
                },
            },
        )



memory_service = MemoryService()