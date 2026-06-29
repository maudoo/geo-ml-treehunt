from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import hash_password, create_access_token, verify_password
from sqlalchemy import select
from app.models import User
from app.schemas.user import UserRegister


async def register_user(db:AsyncSession, data: UserRegister) -> dict:

    existing_user = await db.execute(select(User).where(User.email == data.email))
    if existing_user.scalar_one_or_none() is not None:
       return None

    user = User(
        email=data.email,
        display_name=data.display_name,
        hashed_password=hash_password(data.password)
    )

    db.add(user)
    await db.flush()

    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}

async def login_user(db:AsyncSession, email:str, password:str) -> dict:

    existing_user = await db.execute(select(User).where(User.email == email))
    user = existing_user.scalar_one_or_none()

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}
