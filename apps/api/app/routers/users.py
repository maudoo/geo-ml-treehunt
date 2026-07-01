from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.quest import Quest
from app.schemas.user import UserResponse
from app.services.leveling import get_level_info
import uuid

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.id == uuid.UUID(user_id))
    )
    user = result.scalar_one()

    rank_result = await db.execute(
        select(func.count()).select_from(User).where(User.xp > user.xp)
    )
    rank = rank_result.scalar() + 1

    total_result = await db.execute(select(func.count()).select_from(User))
    total_players = total_result.scalar()

    trees_found_result = await db.execute(
        select(func.count())
        .select_from(Quest)
        .where(Quest.user_id == user.id, Quest.status == "completed")
    )
    trees_found = trees_found_result.scalar()

    level_info = get_level_info(user.xp)

    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        xp=user.xp,
        rank=rank,
        total_players=total_players,
        trees_found=trees_found,
        level=level_info["level"],
        is_max_level=level_info["is_max_level"],
        xp_into_level=level_info["xp_into_level"],
        xp_for_level=level_info["xp_for_level"],
        progress=level_info["progress"],
    )