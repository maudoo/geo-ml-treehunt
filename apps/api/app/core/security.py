from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt
from app.config import settings

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_access_token(user_id:str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": user_id,
        "exp": expire
    }
    return jwt.encode(payload, algorithm=settings.jwt_algorithm, key=settings.jwt_secret_key)

def verify_access_token(token:str) -> str:
    try:
        payload= jwt.decode(token, algorithms=[settings.jwt_algorithm], key=settings.jwt_secret_key)
        user_id:str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

