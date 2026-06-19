from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.models import User, Coach, Booking
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    CoachResponse,
    BookingCreate,
    BookingResponse,
)
from app.auth import hash_password, verify_password, create_access_token, get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "API You Smile Fight funcionando"}


@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    user_exists = db.query(User).filter(User.email == user.email).first()

    if user_exists:
        raise HTTPException(
            status_code=400,
            detail="E-mail já cadastrado"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos"
        )

    token = create_access_token(
        data={"sub": db_user.email}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/coaches", response_model=list[CoachResponse])
def get_coaches(db: Session = Depends(get_db)):
    coaches = db.query(Coach).filter(Coach.active == True).all()
    return coaches

@app.post("/bookings", response_model=BookingResponse)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    coach = db.query(Coach).filter(
        Coach.id == booking.coach_id,
        Coach.active == True
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado"
        )

    existing_booking = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.date == booking.date,
        Booking.time == booking.time,
        Booking.status == "confirmed"
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=400,
            detail="Você já tem uma reserva nesse horário"
        )

    new_booking = Booking(
        user_id=current_user.id,
        coach_id=booking.coach_id,
        date=booking.date,
        time=booking.time,
        status="confirmed"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


@app.get("/bookings/me", response_model=list[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.date.asc(), Booking.time.asc()).all()

    return bookings