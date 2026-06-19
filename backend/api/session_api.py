from fastapi import APIRouter
# from services.session_service import create_session

router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"]
)


@router.post("/test")
async def test_session():

    session = await create_session(
        call_sid="TEST123",
        caller_number="+917015589772"
    )

    return session