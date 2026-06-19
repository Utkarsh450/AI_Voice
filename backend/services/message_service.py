from database.prisma_client import db


class MessageService:

    async def create_message(
        self,
        session_id: int,
        speaker: str,
        content: str,
    ):
        message = await db.message.create(
            data={
                "speaker": speaker,
                "content": content,
                "sessionId": session_id,
            }
        )

        return message

    async def get_session_messages(
        self,
        session_id: int,
    ):
        return await db.message.find_many(
            where={
                "sessionId": session_id
            },
            order={
                "timestamp": "asc"
            }
        )


message_service = MessageService()