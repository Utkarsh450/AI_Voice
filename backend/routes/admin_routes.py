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


# ==========================
# Knowledge Base
# ==========================
from fastapi import UploadFile, File, HTTPException
import os
import shutil
from database.prisma_client import db
from services.rag_service import rag_service
from services.imagekit_service import upload_document as upload_document_to_imagekit

@router.post("/knowledge/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Upload to ImageKit
        imagekit_url = upload_document_to_imagekit(file_path)

        # Create DB record
        doc = await db.document.create(
            data={
                "name": file.filename,
                "path": imagekit_url,
                "processed": False
            }
        )
        
        # Ingest document into vector store
        chunks = await rag_service.ingest_document(file_path)
        
        # Update DB record
        await db.document.update(
            where={"id": doc.id},
            data={"processed": True}
        )
        
        # Remove local file after successful ingestion
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {"message": "Document uploaded and processed successfully.", "chunks": chunks, "document": doc}
    except Exception as e:
        print(f"Error processing document: {e}")
        # Cleanup local file on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/knowledge/documents")
async def get_documents():
    docs = await db.document.find_many(
        order={"uploadedAt": "desc"}
    )
    return docs