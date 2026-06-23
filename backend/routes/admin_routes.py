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

from services.user_service import delete_user_data

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    success = await delete_user_data(user_id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to delete user")
    return {"message": "User deleted"}


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
from services.analytics_service import analytics_service
import services.settings_service as settings_service
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

    doc = None
    try:
        # Upload to ImageKit
        imagekit_url = upload_document_to_imagekit(file_path)

        # Create DB record (initially not processed, not failed)
        doc = await db.document.create(
            data={
                "name": file.filename,
                "path": imagekit_url,
                "processed": False,
                "failed": False,
            }
        )
        
        # Ingest document into vector store
        chunks = await rag_service.ingest_document(file_path, document_id=doc.id)
        
        # Mark as processed successfully
        await db.document.update(
            where={"id": doc.id},
            data={"processed": True, "failed": False}
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
        # Mark the DB record as failed so the UI shows "Failed" instead of "Processing"
        if doc:
            try:
                await db.document.update(
                    where={"id": doc.id},
                    data={"failed": True, "processed": False}
                )
            except Exception as db_err:
                print(f"Could not mark document as failed: {db_err}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge/documents")
async def get_documents():
    docs = await db.document.find_many(
        order={"uploadedAt": "desc"}
    )
    return docs

@router.delete("/knowledge/documents/{document_id}")
async def delete_knowledge_document(document_id: int):
    import asyncio
    
    # 1. Synchronously delete from Prisma DB so the UI fetches instantly reflect the change
    try:
        await db.document.delete(where={"id": document_id})
    except Exception as e:
        print(f"Failed to delete document from DB: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to delete document from database")

    # 2. Asynchronously delete the heavy Vector Store chunks in the background
    async def _delete_doc_background():
        try:
            await rag_service.delete_document(document_id)
        except Exception as e:
            print(f"Failed to delete document from vector store: {e}")

    asyncio.create_task(_delete_doc_background())
        
    return {"message": "Document deleted"}

# ==========================
# Personas
# ==========================
import services.persona_service as persona_service

@router.get("/personas")
async def get_personas():
    return await persona_service.get_all_personas()

@router.post("/personas")
async def create_persona(data: persona_service.PersonaCreate):
    return await persona_service.create_persona(data)

@router.put("/personas/{persona_id}")
async def update_persona(persona_id: int, data: persona_service.PersonaUpdate):
    return await persona_service.update_persona(persona_id, data)

@router.delete("/personas/{persona_id}")
async def delete_persona(persona_id: int):
    result = await persona_service.delete_persona(persona_id)
    if not result:
        raise HTTPException(status_code=404, detail="Persona not found")
    return {"message": "Persona deleted"}

# --- Analytics Routes ---
@router.get("/analytics/dashboard")
async def get_analytics_dashboard():
    return await analytics_service.get_dashboard_stats()

# --- Settings Routes ---
@router.get("/settings")
async def get_settings():
    return await settings_service.get_all_settings()

@router.put("/settings/{key}")
async def update_setting(key: str, data: settings_service.SettingUpdate):
    return await settings_service.update_setting(key, data.value)