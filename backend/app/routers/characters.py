from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, Character
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/characters", tags=["characters"])


# === Schemas ===

class CharacterAttributes(BaseModel):
    strength: int = 2
    dexterity: int = 2
    constitution: int = 2
    intelligence: int = 2
    perception: int = 2
    willpower: int = 2


class Skill(BaseModel):
    name: str
    level: int
    attribute: str  # which attribute it's linked to


class QualityDrawback(BaseModel):
    name: str
    points: int
    description: str = ""


class InventoryItem(BaseModel):
    name: str
    quantity: int = 1
    notes: str = ""


class CharacterData(BaseModel):
    """Full AFMBE character data structure."""
    # Meta
    concept: str = ""
    character_type: str = "Survivor"  # Survivor, Inspired, Zombie Master
    
    # Core stats
    attributes: CharacterAttributes = CharacterAttributes()
    life_points: int = 0
    endurance_points: int = 0
    speed: int = 0
    essence: int = 0
    
    # Lists
    skills: list[Skill] = []
    qualities: list[QualityDrawback] = []
    drawbacks: list[QualityDrawback] = []
    inventory: list[InventoryItem] = []
    
    # Flavor
    avatar: Optional[str] = None  # base64 or URL
    notes: str = ""


class CharacterCreate(BaseModel):
    name: str
    data: CharacterData = CharacterData()


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    data: Optional[CharacterData] = None


class CharacterResponse(BaseModel):
    id: int
    name: str
    data: CharacterData
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class CharacterListItem(BaseModel):
    id: int
    name: str
    concept: str
    character_type: str
    updated_at: str


# === Endpoints ===

@router.get("/", response_model=list[CharacterListItem])
async def list_characters(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all characters for current user."""
    result = await db.execute(
        select(Character).where(Character.user_id == user.id)
    )
    characters = result.scalars().all()
    
    return [
        CharacterListItem(
            id=c.id,
            name=c.name,
            concept=c.data.get("concept", ""),
            character_type=c.data.get("character_type", "Survivor"),
            updated_at=c.updated_at.isoformat()
        )
        for c in characters
    ]


@router.post("/", response_model=CharacterResponse, status_code=status.HTTP_201_CREATED)
async def create_character(
    char: CharacterCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new character."""
    character = Character(
        user_id=user.id,
        name=char.name,
        data=char.data.model_dump()
    )
    db.add(character)
    await db.commit()
    await db.refresh(character)
    
    return CharacterResponse(
        id=character.id,
        name=character.name,
        data=CharacterData(**character.data),
        created_at=character.created_at.isoformat(),
        updated_at=character.updated_at.isoformat()
    )


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific character."""
    result = await db.execute(
        select(Character).where(
            Character.id == character_id,
            Character.user_id == user.id
        )
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    return CharacterResponse(
        id=character.id,
        name=character.name,
        data=CharacterData(**character.data),
        created_at=character.created_at.isoformat(),
        updated_at=character.updated_at.isoformat()
    )


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: int,
    update: CharacterUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a character."""
    result = await db.execute(
        select(Character).where(
            Character.id == character_id,
            Character.user_id == user.id
        )
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    if update.name is not None:
        character.name = update.name
    if update.data is not None:
        character.data = update.data.model_dump()
    
    await db.commit()
    await db.refresh(character)
    
    return CharacterResponse(
        id=character.id,
        name=character.name,
        data=CharacterData(**character.data),
        created_at=character.created_at.isoformat(),
        updated_at=character.updated_at.isoformat()
    )


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a character."""
    result = await db.execute(
        select(Character).where(
            Character.id == character_id,
            Character.user_id == user.id
        )
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    await db.delete(character)
    await db.commit()


# === Export/Import ===

@router.get("/{character_id}/export")
async def export_character(
    character_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export character as shareable JSON."""
    result = await db.execute(
        select(Character).where(
            Character.id == character_id,
            Character.user_id == user.id
        )
    )
    character = result.scalar_one_or_none()
    
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    import base64
    import json
    
    export_data = {
        "name": character.name,
        "data": character.data,
        "version": "1.0"
    }
    
    # Encode to base64 for easy sharing
    json_str = json.dumps(export_data, separators=(',', ':'))
    code = base64.urlsafe_b64encode(json_str.encode()).decode()
    
    return {"code": code, "raw": export_data}


@router.post("/import")
async def import_character(
    code: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> CharacterResponse:
    """Import character from shareable code."""
    import base64
    import json
    
    try:
        json_str = base64.urlsafe_b64decode(code).decode()
        import_data = json.loads(json_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid import code"
        )
    
    character = Character(
        user_id=user.id,
        name=import_data.get("name", "Imported Character"),
        data=import_data.get("data", {})
    )
    db.add(character)
    await db.commit()
    await db.refresh(character)
    
    return CharacterResponse(
        id=character.id,
        name=character.name,
        data=CharacterData(**character.data),
        created_at=character.created_at.isoformat(),
        updated_at=character.updated_at.isoformat()
    )
