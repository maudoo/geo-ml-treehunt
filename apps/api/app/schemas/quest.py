from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid

class TreePreview(BaseModel):
    id: uuid.UUID
    campus_tag_id: str
    common_name: str
    scientific_name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

class QuestDetail(BaseModel):
    id: uuid.UUID
    status: str
    points_awarded: int
    assigned_at: datetime
    expires_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    photo_url: Optional[str] = None
    tree: TreePreview

    class Config:
        from_attributes = True


class QuestSubmission(BaseModel):
    photo_url: str
    latitude: float
    longitude: float


class LeaderboardPlayer(BaseModel):
    display_name: str
    xp: int

    class Config:
        from_attributes = True