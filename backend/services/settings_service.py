from typing import List, Optional, Dict
from pydantic import BaseModel
from database.prisma_client import db

class SettingUpdate(BaseModel):
    value: str

async def get_all_settings() -> List[Dict]:
    # Return as list of dicts for easy frontend parsing
    settings = await db.systemsetting.find_many()
    return [{"id": s.id, "key": s.key, "value": s.value, "category": s.category} for s in settings]

async def get_setting(key: str) -> Optional[str]:
    setting = await db.systemsetting.find_unique(where={"key": key})
    return setting.value if setting else None

async def update_setting(key: str, value: str):
    # Upsert the setting
    existing = await db.systemsetting.find_unique(where={"key": key})
    if existing:
        return await db.systemsetting.update(
            where={"key": key},
            data={"value": value}
        )
    else:
        return await db.systemsetting.create(
            data={"key": key, "value": value, "category": "general"}
        )

async def init_default_settings():
    """Initialize default settings if they don't exist"""
    defaults = {
        "llm_provider": "groq",
        "llm_temperature": "0.3",
        "voice_id": "alloy",
        "vad_threshold": "0.5",
        "max_call_duration": "3600"
    }
    
    for key, value in defaults.items():
        try:
            existing = await db.systemsetting.find_unique(where={"key": key})
            if not existing:
                await db.systemsetting.create(
                    data={"key": key, "value": value, "category": "system"}
                )
        except Exception as e:
            # Silently fail if DB is not reachable or table doesn't exist
            print(f"Failed to init setting {key}: {e}")
