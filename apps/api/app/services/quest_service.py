import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.tree import Tree
from app.models.quest import Quest
from app.config import settings
from datetime import datetime, timezone, timedelta


async def assign_quest(db: AsyncSession, user_id:str) -> Quest | None:

    existing = await db.execute(
        select(Quest).where(
            Quest.user_id == uuid.UUID(user_id),
            Quest.status == "active"        
        )
    )

    if existing.scalar_one_or_none() is not None:
        return "has_active_quest"

    completed_tree_ids = select(Quest.tree_id).where(
        Quest.user_id == uuid.UUID(user_id),
        Quest.status == "completed"
    )

    result =  await db.execute(
        select(Tree)
        .where(Tree.id.not_in(completed_tree_ids))
        .order_by(func.random())
        .limit(1)
    )

    tree = result.scalar_one_or_none()

    if tree is None:
        return "no_trees_available"

    # creating the quest

    quest = Quest(
        user_id=uuid.UUID(user_id),
        tree_id=tree.id,
        status="active",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
    )

    db.add(quest)
    await db.flush()

    # Reload quest with tree data attached
    result = await db.execute(
        select(Quest)
        .where(Quest.id == quest.id)
        .options(selectinload(Quest.tree))
    )
    return result.scalar_one()


async def get_active_quest(db: AsyncSession, user_id: str) -> Quest | None:
    result = await db.execute(
        select(Quest)
        .where(
            Quest.user_id == uuid.UUID(user_id),
            Quest.status == "active"
        )
        .options(selectinload(Quest.tree))
    )
    return result.scalar_one_or_none()

async def submit_quest(
    db: AsyncSession,
    user_id: str,
    quest_id: uuid.UUID,
    photo_url: str,
    latitude: float,
    longitude: float,
) -> Quest | None:

    # Find the quest
    result = await db.execute(
        select(Quest)
        .where(Quest.id == quest_id)
        .options(selectinload(Quest.tree))
    )
    quest = result.scalar_one_or_none()

    # Quest doesn't exist
    if quest is None:
        return "not_found"

    # Quest belongs to someone else
    if quest.user_id != uuid.UUID(user_id):
        return "not_found"

    # Quest already completed or expired
    if quest.status != "active":
        return "already_completed"

    # Expiry check
    if quest.expires_at and datetime.now(timezone.utc) > quest.expires_at:
        quest.status = "expired"
        await db.flush()
        return "expired"

    # photo_url must point to this user's own folder in our bucket, not an arbitrary URL
    expected_prefix = f"https://storage.googleapis.com/{settings.gcs_bucket}/photos/{user_id}/"
    if not photo_url.startswith(expected_prefix) or not photo_url.endswith(".jpg"):
        return "invalid_photo_url"

    # ponytail: proximity check disabled for testing — re-enable before go-live
    # proximity = await db.execute(
    #     text("""
    #         SELECT ST_DWithin(
    #             location::geography,
    #             ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
    #             :radius
    #         )
    #         FROM trees WHERE id = :tree_id
    #     """),
    #     {
    #         "lng": longitude,
    #         "lat": latitude,
    #         "radius": settings.quest_proximity_meters,
    #         "tree_id": str(quest.tree_id),
    #     },
    # )
    # if not proximity.scalar():
    #     return "too_far"

    # Complete the quest
    quest.photo_url = photo_url
    quest.status = "completed"
    quest.points_awarded = settings.points_per_quest
    quest.completed_at = datetime.now(timezone.utc)

    # Award points to student
    user_result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id))
    )
    user = user_result.scalar_one()
    user.xp += settings.points_per_quest

    # Update tree counter
    quest.tree.times_found += 1

    await db.flush()
    return quest

async def cancel_quest(db: AsyncSession, user_id: str, quest_id: uuid.UUID):
    result = await db.execute(
        select(Quest).where(Quest.id == quest_id).options(selectinload(Quest.tree))
    )
    quest = result.scalar_one_or_none()
    if quest is None or quest.user_id != uuid.UUID(user_id):
        return "not_found"
    if quest.status != "active":
        return "not_active"
    quest.status = "cancelled"
    await db.flush()
    return quest


async def dismiss_quest(db: AsyncSession, user_id: str, quest_id: uuid.UUID):
    result = await db.execute(
        select(Quest).where(Quest.id == quest_id).options(selectinload(Quest.tree))
    )
    quest = result.scalar_one_or_none()
    if quest is None or quest.user_id != uuid.UUID(user_id):
        return "not_found"
    if quest.status != "active":
        return "not_active"
    quest.status = "expired"
    await db.flush()
    return quest


async def get_all_quests(db: AsyncSession, user_id: str) -> list:
    result = await db.execute(
        select(Quest)
        .where(Quest.user_id == uuid.UUID(user_id))
        .options(selectinload(Quest.tree))
        .order_by(Quest.assigned_at.desc())
    )
    return result.scalars().all()


async def get_leaderboard(db: AsyncSession) -> list:
    result = await db.execute(
        select(User)
        .order_by(User.xp.desc())
        .limit(10)
    )
    return result.scalars().all()
