from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

class Coach(Base):
    __tablename__ = "coaches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    photo = Column(String, nullable=True)
    active = Column(Boolean, default=True)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("class_slots.id"), nullable=False)

    booking_type = Column(String, default="individual")
    spots = Column(Integer, default=1)

    status = Column(String, default="confirmed")

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship("User")
    slot = relationship("ClassSlot")

class ClassSlot(Base):
    __tablename__ = "class_slots"

    id = Column(Integer, primary_key=True, index=True)

    coach_id = Column(Integer, ForeignKey("coaches.id"), nullable=False)

    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)

    active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    coach = relationship("Coach")