from pydantic import BaseModel, EmailStr
from datetime import date, time


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
    coach_id: int
    date: date
    time: time


class BookingResponse(BaseModel):
    id: int
    user_id: int
    coach_id: int
    date: date
    time: time
    status: str

    class Config:
        from_attributes = True