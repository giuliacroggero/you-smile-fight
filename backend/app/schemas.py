import datetime

from pydantic import BaseModel, EmailStr, Field


# =========================================================
# USUÁRIOS
# =========================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# =========================================================
# COACHES
# =========================================================

class CoachCreate(BaseModel):
    name: str
    specialty: str = "Coach"
    photo: str | None = None
    active: bool = True


class CoachUpdate(BaseModel):
    name: str | None = None
    specialty: str | None = None
    photo: str | None = None
    active: bool | None = None


class CoachResponse(BaseModel):
    id: int
    name: str
    specialty: str
    photo: str | None = None
    active: bool

    class Config:
        from_attributes = True


# =========================================================
# HORÁRIOS PERSISTIDOS
# =========================================================

class ClassSlotCreate(BaseModel):
    coach_id: int
    date: datetime.date
    time: datetime.time


class ClassSlotUpdate(BaseModel):
    coach_id: int | None = None
    date: datetime.date | None = None
    time: datetime.time | None = None
    active: bool | None = None


class ClassSlotResponse(BaseModel):
    id: int
    coach_id: int
    date: datetime.date
    time: datetime.time
    active: bool

    class Config:
        from_attributes = True


# =========================================================
# AGENDA AUTOMÁTICA
# =========================================================

class AutomaticSlotResponse(BaseModel):
    slot_id: int | None = None
    booking_id: int | None = None

    coach_id: int
    date: datetime.date
    time: datetime.time

    # available | reserved | blocked
    status: str

    student_id: int | None = None
    student_name: str | None = None

    booking_type: str | None = None
    spots: int | None = None


# =========================================================
# RESERVAS
# =========================================================

class BookingCreate(BaseModel):
    slot_id: int
    booking_type: str = "individual"
    spots: int = Field(default=1, ge=1, le=5)


class AutomaticBookingCreate(BaseModel):
    coach_id: int
    date: datetime.date
    time: datetime.time
    booking_type: str = "individual"
    spots: int = Field(default=1, ge=1, le=5)

class AdminBookingCreate(BaseModel):
    user_id: int
    coach_id: int
    date: datetime.date
    time: datetime.time
    booking_type: str = "individual"
    spots: int = Field(default=1, ge=1, le=5)

class AutomaticSlotBlockCreate(BaseModel):
    coach_id: int
    date: datetime.date
    time: datetime.time

class BookingResponse(BaseModel):
    id: int
    user_id: int
    slot_id: int | None = None
    booking_type: str
    spots: int
    status: str

    class Config:
        from_attributes = True