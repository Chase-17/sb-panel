from datetime import datetime
from sqlalchemy import ForeignKey, Text, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    nickname: Mapped[str] = mapped_column(unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    # WebAuthn credentials (can have multiple devices)
    credentials: Mapped[list["WebAuthnCredential"]] = relationship(
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    
    # Characters
    characters: Mapped[list["Character"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )


class WebAuthnCredential(Base):
    __tablename__ = "webauthn_credentials"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    # WebAuthn data
    credential_id: Mapped[bytes] = mapped_column(unique=True)
    public_key: Mapped[bytes]
    sign_count: Mapped[int] = mapped_column(default=0)
    device_name: Mapped[Optional[str]] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    user: Mapped["User"] = relationship(back_populates="credentials")


class Character(Base):
    __tablename__ = "characters"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    name: Mapped[str]
    # All character data stored as JSON
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    user: Mapped["User"] = relationship(back_populates="characters")


class SharedCharacter(Base):
    __tablename__ = "shared_characters"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    name: Mapped[str]
    data: Mapped[dict] = mapped_column(JSON)
    created_by: Mapped[Optional[str]] = mapped_column(nullable=True)  # nickname
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
