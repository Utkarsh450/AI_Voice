from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
async def root():
    return {
        "message": "AI Voice Call Center Backend Running 🚀"
    }


@router.get("/health")
async def health():
    return {
        "status": "healthy"

    }