import base64
from typing import Optional

from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json,
)
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    ResidentKeyRequirement,
    PublicKeyCredentialDescriptor,
)

from app.config import get_settings

settings = get_settings()


def get_registration_options(user_id: int, nickname: str):
    """Generate WebAuthn registration options for a new user."""
    options = generate_registration_options(
        rp_id=settings.rp_id,
        rp_name=settings.rp_name,
        user_id=str(user_id).encode(),
        user_name=nickname,
        user_display_name=nickname,
        authenticator_selection=AuthenticatorSelectionCriteria(
            resident_key=ResidentKeyRequirement.PREFERRED,
            user_verification=UserVerificationRequirement.PREFERRED,
        ),
    )
    return options


def verify_registration(
    credential: dict,
    expected_challenge: bytes,
) -> tuple[bytes, bytes, int]:
    """
    Verify registration response.
    Returns (credential_id, public_key, sign_count)
    """
    verification = verify_registration_response(
        credential=credential,
        expected_challenge=expected_challenge,
        expected_rp_id=settings.rp_id,
        expected_origin=settings.rp_origin,
    )
    return (
        verification.credential_id,
        verification.credential_public_key,
        verification.sign_count,
    )


def get_authentication_options(credentials: list[bytes]):
    """Generate WebAuthn authentication options for existing user."""
    allow_credentials = [
        PublicKeyCredentialDescriptor(id=cred_id)
        for cred_id in credentials
    ]
    
    options = generate_authentication_options(
        rp_id=settings.rp_id,
        allow_credentials=allow_credentials,
        user_verification=UserVerificationRequirement.PREFERRED,
    )
    return options


def verify_authentication(
    credential: dict,
    expected_challenge: bytes,
    stored_public_key: bytes,
    stored_sign_count: int,
    credential_id: bytes,
) -> int:
    """
    Verify authentication response.
    Returns new sign_count.
    """
    verification = verify_authentication_response(
        credential=credential,
        expected_challenge=expected_challenge,
        expected_rp_id=settings.rp_id,
        expected_origin=settings.rp_origin,
        credential_public_key=stored_public_key,
        credential_current_sign_count=stored_sign_count,
    )
    return verification.new_sign_count
