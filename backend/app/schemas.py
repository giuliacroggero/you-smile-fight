from pydantic import BaseModel, EmailStr
import datetime


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


class CoachResponse(BaseModel):
    id: int
    name: str
    specialty: str
    photo: str | None
    active: bool

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    slot_id: int
    booking_type: str = "individual"
    spots: int = 1


class BookingResponse(BaseModel):
    id: int
    user_id: int
    slot_id: int
    booking_type: str
    spots: int
    status: str

    class Config:
        from_attributes = True

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