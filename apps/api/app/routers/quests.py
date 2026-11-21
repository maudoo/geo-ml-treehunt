import uuid
import boto3
from botocore.config import Config
from fastapi import APIRouter, Depends, HTTPException, status
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


@router.post("/upload-url")
async def get_upload_url(
    user_id: str = Depends(get_current_user),
):
    blob_name = f"photos/{user_id}/{uuid.uuid4()}.jpg"

    s3 = boto3.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    upload_url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.r2_bucket, "Key": blob_name, "ContentType": "image/jpeg"},
        ExpiresIn=900,
    )
    public_url = f"{settings.r2_public_url}/{blob_name}"
    return {"upload_url": upload_url, "photo_url": public_url}