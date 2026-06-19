from fastapi import APIRouter
from services.admin_service import (
    admin_service,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


# ==========================
# Dashboard
# ==========================

@router.get("/stats")
async def get_stats():
    return {
        "totalCalls":
            await admin_service
            .get_total_calls(),

        "totalUsers":
            await admin_service
            .get_total_users(),

        "totalDocuments":
            await admin_service
            .get_total_documents(),

        "totalPersonas":
            await admin_service
            .get_total_personas(),

        "todayCalls":
            await admin_service
            .get_today_calls(),

        "avgDuration":
            await admin_service
            .get_avg_duration(),

        "completedCalls":
            await admin_service
            .get_completed_calls(),

        "successRate":
            await admin_service
            .get_success_rate(),
    }


# ==========================
# Charts
# ==========================

@router.get(
    "/calls-trend"
)
async def get_calls_trend():
    return await (
        admin_service
        .get_calls_trend()
    )


@router.get(
    "/persona-distribution"
)
async def get_persona_distribution():
    return await (
        admin_service
        .get_persona_distribution()
    )


# ==========================
# Tables
# ==========================

@router.get(
    "/recent-sessions"
)
async def get_recent_sessions():
    return await (
        admin_service
        .get_recent_sessions()
    )


@router.get(
    "/top-users"
)
async def get_top_users():
    return await (
        admin_service
        .get_top_users()
    )


# ==========================
# Users
# ==========================

@router.get(
    "/users"
)
async def get_users():
    return await (
        admin_service
        .get_users()
    )


@router.get(
    "/users/{user_id}"
)
async def get_user(
    user_id: str,
):
    return await (
        admin_service
        .get_user(
            user_id
        )
    )


# ==========================
# Monitoring
# ==========================

@router.get(
    "/health"
)
async def get_health():
    return {
        "postgres":
            await admin_service
            .postgres_status(),

        "worker":
            True,

        "livekit":
            await admin_service
            .livekit_status(),

        "websocket":
            True,

        "groq":
            await admin_service
            .groq_status(),
    }