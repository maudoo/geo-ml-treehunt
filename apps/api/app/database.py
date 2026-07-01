from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

connect_args = {"ssl": "require"} if settings.database_ssl else {}

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    # Neon serverless closes idle connections aggressively and caps total
    # connections low. Keep the pool small and recycle before Neon drops them.
    pool_size=5,
    max_overflow=5,
    pool_timeout=10,
    pool_recycle=300,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_ = AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise 