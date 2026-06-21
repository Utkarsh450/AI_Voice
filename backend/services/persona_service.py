from typing import List, Optional
from prisma.models import Persona
from pydantic import BaseModel
from database.prisma_client import db

class PersonaCreate(BaseModel):
    name: str
    description: str
    systemPrompt: str

class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    systemPrompt: Optional[str] = None

async def get_all_personas() -> List[Persona]:
    return await db.persona.find_many(
        order={"createdAt": "desc"}
    )

async def get_persona_by_id(persona_id: int) -> Optional[Persona]:
    return await db.persona.find_unique(
        where={"id": persona_id}
    )

async def create_persona(data: PersonaCreate) -> Persona:
    return await db.persona.create(
        data={
            "name": data.name,
            "description": data.description,
            "systemPrompt": data.systemPrompt
        }
    )

async def update_persona(persona_id: int, data: PersonaUpdate) -> Optional[Persona]:
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.description is not None:
        update_data["description"] = data.description
    if data.systemPrompt is not None:
        update_data["systemPrompt"] = data.systemPrompt
        
    if not update_data:
        return await get_persona_by_id(persona_id)
        
    return await db.persona.update(
        where={"id": persona_id},
        data=update_data
    )

async def delete_persona(persona_id: int) -> Optional[Persona]:
    return await db.persona.delete(
        where={"id": persona_id}
    )
