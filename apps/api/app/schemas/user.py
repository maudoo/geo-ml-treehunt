from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID


class UserRegister(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=8)

    # bcrypt 5.0.0 hashes at most 72 bytes and raises ValueError beyond that.
    # Check byte length (not chars) so multibyte passwords get a 422, not a 500.
    @field_validator("password")
    @classmethod
    def password_max_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)

    @field_validator("password")
    @classmethod
    def password_max_bytes(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v

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
    trees_found: int
    level: int
    is_max_level: bool
    xp_into_level: int
    xp_for_level: int
    progress: float

    class Config:
        from_attributes = True

