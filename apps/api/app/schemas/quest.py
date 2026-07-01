from pydantic import BaseModel, Field, computed_field
from datetime import datetime
from typing import Optional
import uuid


def rarity_for(times_found: int) -> str:
    # ponytail: fixed thresholds, not percentiles. Most of 1,647 trees sit at 0-2
    # finds, so the rare end is the long tail. Switch to a percentile if the
    # distribution shifts. Fewer finds = rarer.
    if times_found <= 1:
        return "legendary"
    if times_found <= 5:
        return "rare"
    return "common"


class TreePreview(BaseModel):
    id: uuid.UUID
    campus_tag_id: str
    common_name: str
    scientific_name: str
    latitude: float
    longitude: float
    times_found: int

    @computed_field
    @property
    def rarity(self) -> str:
        return rarity_for(self.times_found)

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
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class LeaderboardPlayer(BaseModel):
    display_name: str
    xp: int

    class Config:
        from_attributes = True