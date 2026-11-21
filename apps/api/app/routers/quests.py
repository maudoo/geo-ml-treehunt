import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.quest import QuestDetail, QuestSubmission, LeaderboardPlayer
from app.config import settings
from app.services.quest_service import (
    assign_quest,
    get_active_quest,
    get_all_quests,
    submit_quest,
    cancel_quest,
    dismiss_quest,
    get_leaderboard,
)

router = APIRouter(prefix="/quests", tags=["quests"])


@router.post("/assign", response_model=QuestDetail, status_code=201)
async def assign(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await assign_quest(db, user_id)
    if result == "has_active_quest":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active quest. Finish it first.",
        )
    if result == "no_trees_available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have completed all available trees. Maximum level reached!",
        )
    return result


@router.get("/me", response_model=QuestDetail)
async def get_my_quest(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    quest = await get_active_quest(db, user_id)
    if quest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active quest. Assign one first.",
        )
    return quest


@router.post("/{quest_id}/submit", response_model=QuestDetail)
async def submit(
    quest_id: uuid.UUID,
    data: QuestSubmission,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await submit_quest(db, user_id, quest_id, data.photo_url, data.latitude, data.longitude)
    if result == "not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found.")
    if result == "already_completed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This quest is already completed.")
    if result == "too_far":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not close enough to the tree.")
    if result == "invalid_photo_url":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Photo URL is invalid.")
    if result == "expired":
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Quest has expired.")
    return result


@router.post("/{quest_id}/cancel", response_model=QuestDetail)
async def cancel(
    quest_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await cancel_quest(db, user_id, quest_id)
    if result == "not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found.")
    if result == "not_active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quest is not active.")
    return result


@router.post("/{quest_id}/dismiss", response_model=QuestDetail)
async def dismiss(
    quest_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await dismiss_quest(db, user_id, quest_id)
    if result == "not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found.")
    if result == "not_active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quest is not active.")
    return result


@router.get("/history", response_model=list[QuestDetail])
async def get_history(
    user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_all_quests(db, user_id)


@router.get("/leaderboard", response_model=list[LeaderboardPlayer])
async def leaderboard(
    db: AsyncSession = Depends(get_db),
):
    return await get_leaderboard(db)


@router.post("/upload-photo")
async def upload_photo(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    if file.content_type != "image/jpeg":
        raise HTTPException(status_code=400, detail="Only JPEG photos accepted.")

    contents = await file.read(settings.max_photo_bytes + 1)
    if len(contents) > settings.max_photo_bytes:
        raise HTTPException(status_code=413, detail="Photo exceeds 10 MB limit.")

    user_dir = Path(settings.upload_dir) / user_id
    user_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4()}.jpg"
    (user_dir / filename).write_bytes(contents)

    # Build absolute URL — Railway sets x-forwarded-proto for HTTPS
    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("host", str(request.url.hostname))
    photo_url = f"{scheme}://{host}/photos/{user_id}/{filename}"

    return {"photo_url": photo_url}
