from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.auth_service import register_user, login_user
from app.schemas.user import UserRegister, UserLogin, TokenResponse

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201
)

async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await register_user(db, data)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return result

@router.post(
    "/login",
    response_model=TokenResponse
)

async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await login_user(db, data.email, data.password)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return result