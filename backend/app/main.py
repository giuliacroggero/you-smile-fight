from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, datetime, time, timedelta

from app.database import engine, Base, SessionLocal
from app.models import User, Coach, Booking, ClassSlot
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    CoachResponse,
    CoachCreate,
    CoachUpdate,
    BookingCreate,
    BookingResponse,
    ClassSlotCreate,
    ClassSlotUpdate,
    ClassSlotResponse,
    AutomaticBookingCreate,
    AutomaticSlotResponse,
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin,
)

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

def get_business_hours(selected_date: date) -> tuple[int, int]:
    """
    Retorna o primeiro e o último horário disponíveis para o dia.

    Segunda a sexta: 06:00 até 21:00
    Sábado: 06:00 até 16:00
    Domingo: 06:00 até 14:00
    """

    weekday = selected_date.weekday()

    if weekday <= 4:
        return 6, 21

    if weekday == 5:
        return 6, 16

    return 6, 14


def is_valid_business_time(
    selected_date: date,
    selected_time: time,
) -> bool:
    start_hour, end_hour = get_business_hours(selected_date)

    return (
        selected_time.minute == 0
        and selected_time.second == 0
        and start_hour <= selected_time.hour <= end_hour
    )

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
    slot = db.query(ClassSlot).filter(
        ClassSlot.id == booking.slot_id,
        ClassSlot.active == True
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado"
        )

    slot_already_booked = db.query(Booking).filter(
        Booking.slot_id == booking.slot_id,
        Booking.status == "confirmed"
    ).first()

    if slot_already_booked:
        raise HTTPException(
            status_code=400,
            detail="Esse horário já foi reservado"
        )

    new_booking = Booking(
        user_id=current_user.id,
        slot_id=booking.slot_id,
        booking_type=booking.booking_type,
        spots=booking.spots,
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
    ).order_by(Booking.created_at.desc()).all()

    return bookings

@app.get("/admin/test")
def admin_test(admin: User = Depends(get_current_admin)):
    return {
        "message": "Você acessou uma rota de administrador",
        "admin": admin.email
    }

@app.post("/admin/coaches", response_model=CoachResponse)
def create_coach(
    coach: CoachCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    new_coach = Coach(
        name=coach.name,
        specialty=coach.specialty,
        photo=coach.photo,
        active=coach.active
    )

    db.add(new_coach)
    db.commit()
    db.refresh(new_coach)

    return new_coach


@app.get("/admin/coaches", response_model=list[CoachResponse])
def admin_get_coaches(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(Coach).order_by(Coach.id.asc()).all()


@app.put("/admin/coaches/{coach_id}", response_model=CoachResponse)
def update_coach(
    coach_id: int,
    coach_data: CoachUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    coach = db.query(Coach).filter(Coach.id == coach_id).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado"
        )

    if coach_data.name is not None:
        coach.name = coach_data.name

    if coach_data.specialty is not None:
        coach.specialty = coach_data.specialty

    if coach_data.photo is not None:
        coach.photo = coach_data.photo

    if coach_data.active is not None:
        coach.active = coach_data.active

    db.commit()
    db.refresh(coach)

    return coach


@app.delete("/admin/coaches/{coach_id}")
def delete_coach(
    coach_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    coach = db.query(Coach).filter(Coach.id == coach_id).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado"
        )

    coach.active = False

    db.commit()

    return {
        "message": "Coach inativado com sucesso"
    }

@app.post("/admin/slots", response_model=ClassSlotResponse)
def create_slot(
    slot: ClassSlotCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    coach = db.query(Coach).filter(
        Coach.id == slot.coach_id,
        Coach.active == True
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado"
        )

    existing_slot = db.query(ClassSlot).filter(
        ClassSlot.coach_id == slot.coach_id,
        ClassSlot.date == slot.date,
        ClassSlot.time == slot.time,
        ClassSlot.active == True
    ).first()

    if existing_slot:
        raise HTTPException(
            status_code=400,
            detail="Esse coach já possui esse horário cadastrado"
        )

    new_slot = ClassSlot(
        coach_id=slot.coach_id,
        date=slot.date,
        time=slot.time,
        active=True
    )

    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)

    return new_slot


@app.get("/admin/slots", response_model=list[ClassSlotResponse])
def admin_get_slots(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(ClassSlot).order_by(
        ClassSlot.date.asc(),
        ClassSlot.time.asc()
    ).all()


@app.put("/admin/slots/{slot_id}", response_model=ClassSlotResponse)
def update_slot(
    slot_id: int,
    slot_data: ClassSlotUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    slot = db.query(ClassSlot).filter(ClassSlot.id == slot_id).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado"
        )

    if slot_data.coach_id is not None:
        coach = db.query(Coach).filter(
            Coach.id == slot_data.coach_id,
            Coach.active == True
        ).first()

        if not coach:
            raise HTTPException(
                status_code=404,
                detail="Coach não encontrado"
            )

        slot.coach_id = slot_data.coach_id

    if slot_data.date is not None:
        slot.date = slot_data.date

    if slot_data.time is not None:
        slot.time = slot_data.time

    if slot_data.active is not None:
        slot.active = slot_data.active

    db.commit()
    db.refresh(slot)

    return slot


@app.delete("/admin/slots/{slot_id}")
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    slot = db.query(ClassSlot).filter(ClassSlot.id == slot_id).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado"
        )

    slot.active = False
    db.commit()

    return {
        "message": "Horário inativado com sucesso"
    }

@app.get("/slots", response_model=list[ClassSlotResponse])
def get_available_slots(db: Session = Depends(get_db)):
    slots = db.query(ClassSlot).filter(
        ClassSlot.active == True
    ).order_by(
        ClassSlot.date.asc(),
        ClassSlot.time.asc()
    ).all()

    return slots