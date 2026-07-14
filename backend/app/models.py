from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Time,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    bookings = relationship(
        "Booking",
        back_populates="user",
    )


class Coach(Base):
    __tablename__ = "coaches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False, default="Coach")
    photo = Column(String, nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    slots = relationship(
        "ClassSlot",
        back_populates="coach",
    )


class ClassSlot(Base):
    __tablename__ = "class_slots"

    id = Column(Integer, primary_key=True, index=True)

    coach_id = Column(
        Integer,
        ForeignKey("coaches.id"),
        nullable=False,
        index=True,
    )

    date = Column(Date, nullable=False, index=True)
    time = Column(Time, nullable=False)
    active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    coach = relationship(
        "Coach",
        back_populates="slots",
    )

    bookings = relationship(
        "Booking",
        back_populates="slot",
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # Temporariamente opcional para aceitar reservas antigas.
    slot_id = Column(
        Integer,
        ForeignKey("class_slots.id"),
        nullable=True,
        index=True,
    )

    booking_type = Column(
        String,
        default="individual",
        nullable=False,
    )

    spots = Column(
        Integer,
        default=1,
        nullable=False,
    )

    status = Column(
        String,
        default="confirmed",
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="bookings",
    )

    slot = relationship(
        "ClassSlot",
        back_populates="bookings",
    )