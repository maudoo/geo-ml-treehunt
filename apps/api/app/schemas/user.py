from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserRegister(BaseModel):
    email: EmailStr
    display_name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: str
    xp: int
    rank: int
    total_players: int
    level: int
    is_max_level: bool
    xp_into_level: int
    xp_for_level: int
    progress: float

    class Config:
        from_attributes = True

