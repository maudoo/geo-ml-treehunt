import secrets
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.reset_token import PasswordResetToken
from app.core.security import hash_password
from app.config import settings
import resend


async def request_password_reset(db: AsyncSession, email: str) -> bool:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None:
        return True  # don't reveal whether email exists

    token_value = secrets.token_urlsafe(32)
    token = PasswordResetToken(
        user_id=user.id,
        token=token_value,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(token)
    await db.flush()

    resend.api_key = settings.resend_api_key
    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": email,
        "subject": "Reset your AlphaHawk password",
        "html": f"""
            <p>Hi {user.display_name},</p>
            <p>Your password reset code is:</p>
            <h2 style="letter-spacing: 4px">{token_value}</h2>
            <p>Enter this code in the app. It expires in 1 hour.</p>
            <p>If you didn't request this, ignore this email.</p>
        """,
    })
    return True


async def reset_password(db: AsyncSession, token_value: str, new_password: str) -> bool:
    result = await db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token == token_value)
    )
    token = result.scalar_one_or_none()

    if token is None or token.used:
        return False
    if datetime.now(timezone.utc) > token.expires_at:
        return False

    user_result = await db.execute(select(User).where(User.id == token.user_id))
    user = user_result.scalar_one()
    user.hashed_password = hash_password(new_password)

    token.used = True
    await db.flush()
    return True
