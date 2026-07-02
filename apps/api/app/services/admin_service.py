import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.quest import Quest


async def get_completed_quests(db: AsyncSession) -> list:
    result = await db.execute(
        select(Quest)
        .where(Quest.status == "completed", Quest.photo_url.isnot(None))
        .options(selectinload(Quest.user), selectinload(Quest.tree))
        .order_by(Quest.completed_at.desc())
    )
    return result.scalars().all()


async def set_user_active(db: AsyncSession, user_id: uuid.UUID, is_active: bool) -> User | None:
    user = await db.get(User, user_id)
    if user is None:
        return None
    user.is_active = is_active
    await db.flush()
    return user
