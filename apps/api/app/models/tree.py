import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship 
from app.database import Base
from geoalchemy2 import Geometry

class Tree(Base):

    __tablename__ = "trees"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    campus_tag_id: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    scientific_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    common_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    location: Mapped[object] = mapped_column(
        Geometry(geometry_type='POINT', srid=4326),
        nullable=False,
    )

    times_assigned: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    times_found: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    imported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    last_synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    quests: Mapped[list["Quest"]] = relationship(
        "Quest",
        back_populates="tree"
    )