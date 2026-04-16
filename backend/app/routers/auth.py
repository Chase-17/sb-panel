import base64
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from webauthn import options_to_json

from app.database import get_db
from app.models import User, WebAuthnCredential
from app.auth.jwt import create_access_token
from app.auth.webauthn import (
    get_registration_options,
    verify_registration,
    get_authentication_options,
    verify_authentication,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory challenge storage (use Redis in production)
_challenges: dict[str, bytes] = {}


class NicknameRequest(BaseModel):
    nickname: str


class RegistrationResponse(BaseModel):
    credential: dict


class AuthenticationResponse(BaseModel):
    credential: dict


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nickname: str


class UserCheckResponse(BaseModel):
    exists: bool
    nickname: str


# === Registration Flow ===

@router.post("/check-nickname")
async def check_nickname(
    request: NicknameRequest,
    db: AsyncSession = Depends(get_db)
) -> UserCheckResponse:
    """Check if nickname exists (determines register vs login flow)."""
    result = await db.execute(
        select(User).where(User.nickname == request.nickname.lower())
    )
    user = result.scalar_one_or_none()
    return UserCheckResponse(exists=user is not None, nickname=request.nickname)


@router.post("/register/begin")
async def register_begin(
    request: NicknameRequest,
    db: AsyncSession = Depends(get_db)
):
    """Start WebAuthn registration for new user."""
    nickname = request.nickname.lower().strip()
    
    if len(nickname) < 2 or len(nickname) > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nickname must be 2-20 characters"
        )
    
    # Check if exists
    result = await db.execute(select(User).where(User.nickname == nickname))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nickname already taken"
        )
    
    # Create user (without credential yet)
    user = User(nickname=nickname)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Generate registration options
    options = get_registration_options(user.id, nickname)
    
    # Store challenge
    _challenges[nickname] = options.challenge
    
    return {
        "options": options_to_json(options),
        "user_id": user.id
    }


@router.post("/register/complete")
async def register_complete(
    request: RegistrationResponse,
    nickname: str,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Complete WebAuthn registration."""
    nickname = nickname.lower()
    
    challenge = _challenges.pop(nickname, None)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration session expired"
        )
    
    # Get user
    result = await db.execute(select(User).where(User.nickname == nickname))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        credential_id, public_key, sign_count = verify_registration(
            request.credential,
            challenge
        )
    except Exception as e:
        # Rollback user creation on failed verification
        await db.delete(user)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )
    
    # Save credential
    webauthn_cred = WebAuthnCredential(
        user_id=user.id,
        credential_id=credential_id,
        public_key=public_key,
        sign_count=sign_count,
    )
    db.add(webauthn_cred)
    await db.commit()
    
    # Return token
    token = create_access_token(user.id, user.nickname)
    return TokenResponse(access_token=token, nickname=user.nickname)


# === Authentication Flow ===

@router.post("/login/begin")
async def login_begin(
    request: NicknameRequest,
    db: AsyncSession = Depends(get_db)
):
    """Start WebAuthn authentication for existing user."""
    nickname = request.nickname.lower()
    
    result = await db.execute(
        select(User)
        .options(selectinload(User.credentials))
        .where(User.nickname == nickname)
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.credentials:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no credentials registered"
        )
    
    credential_ids = [c.credential_id for c in user.credentials]
    options = get_authentication_options(credential_ids)
    
    # Store challenge
    _challenges[nickname] = options.challenge
    
    return {"options": options_to_json(options)}


@router.post("/login/complete")
async def login_complete(
    request: AuthenticationResponse,
    nickname: str,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Complete WebAuthn authentication."""
    nickname = nickname.lower()
    
    challenge = _challenges.pop(nickname, None)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login session expired"
        )
    
    result = await db.execute(
        select(User)
        .options(selectinload(User.credentials))
        .where(User.nickname == nickname)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find matching credential
    credential_id_b64 = request.credential.get("id", "")
    credential_id = base64.urlsafe_b64decode(credential_id_b64 + "==")
    
    matching_cred = None
    for cred in user.credentials:
        if cred.credential_id == credential_id:
            matching_cred = cred
            break
    
    if not matching_cred:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credential not found"
        )
    
    try:
        new_sign_count = verify_authentication(
            request.credential,
            challenge,
            matching_cred.public_key,
            matching_cred.sign_count,
            matching_cred.credential_id,
        )
        matching_cred.sign_count = new_sign_count
        await db.commit()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )
    
    token = create_access_token(user.id, user.nickname)
    return TokenResponse(access_token=token, nickname=user.nickname)
