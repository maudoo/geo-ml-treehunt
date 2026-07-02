from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.auth_service import register_user, login_user
from app.services.reset_service import request_password_reset, reset_password
from app.schemas.user import UserRegister, UserLogin, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest

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
            status_code=status.HTTP_409_CONFLICT,
            detail="Registration failed"
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


@router.post("/forgot-password", status_code=200)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await request_password_reset(db, data.email)
    return {"message": "If that email exists, a reset code has been sent."}


@router.post("/reset-password", status_code=200)
async def reset_password_route(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    success = await reset_password(db, data.token, data.new_password)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset code.")
    return {"message": "Password reset successfully."}