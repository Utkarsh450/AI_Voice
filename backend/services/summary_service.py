from database.prisma_client import db


class SummaryService:

    async def create_summary( self, session_id: int, summary: str, user_facts: str | None = None, open_items: str | None = None, action_items: str | None = None):
     return await db.summary.upsert(
    where={
        "sessionId": session_id
    },
    data={
        "create": {
            "summary": summary,
            "userFacts": user_facts,
            "openItems": open_items,
            "actionItems": action_items,
            "sessionId": session_id,
        },
        "update": {
            "summary": summary,
            "userFacts": user_facts,
            "openItems": open_items,
            "actionItems": action_items,
        },
    },
)

    async def get_session_summary(
        self,
        session_id: int,
    ):
        return await db.summary.find_first(
            where={
                "sessionId": session_id
            }
        )





summary_service = SummaryService()