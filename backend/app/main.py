from datetime import date, time, timedelta

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload

from app.auth import (
    create_access_token,
    get_current_admin,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import Base, SessionLocal, engine
from app.models import Booking, ClassSlot, Coach, User
from app.schemas import (
    AutomaticBookingCreate,
    AutomaticSlotBlockCreate,
    AdminBookingCreate,
    AutomaticSlotResponse,
    BookingCreate,
    BookingResponse,
    ClassSlotCreate,
    ClassSlotResponse,
    ClassSlotUpdate,
    CoachCreate,
    CoachResponse,
    CoachUpdate,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="You Smile Fight API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# BANCO DE DADOS
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# REGRAS DE FUNCIONAMENTO
# =========================================================

def get_business_hours(selected_date: date) -> tuple[int, int]:
    """
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


def normalize_schedule_time(selected_time: time) -> time:
    return selected_time.replace(
        minute=0,
        second=0,
        microsecond=0,
    )


def is_valid_business_time(
    selected_date: date,
    selected_time: time,
) -> bool:
    start_hour, end_hour = get_business_hours(selected_date)

    return (
        selected_time.minute == 0
        and selected_time.second == 0
        and selected_time.microsecond == 0
        and start_hour <= selected_time.hour <= end_hour
    )


# =========================================================
# API
# =========================================================

@app.get("/")
def home():
    return {
        "message": "API You Smile Fight funcionando",
    }


# =========================================================
# AUTENTICAÇÃO E USUÁRIOS
# =========================================================

@app.post(
    "/register",
    response_model=UserResponse,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    normalized_email = user.email.lower().strip()

    user_exists = db.query(User).filter(
        User.email == normalized_email,
    ).first()

    if user_exists:
        raise HTTPException(
            status_code=400,
            detail="E-mail já cadastrado",
        )

    new_user = User(
        name=user.name.strip(),
        email=normalized_email,
        password=hash_password(user.password),
        is_admin=False,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    normalized_email = user.email.lower().strip()

    db_user = db.query(User).filter(
        User.email == normalized_email,
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos",
        )

    if not verify_password(
        user.password,
        db_user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="E-mail ou senha inválidos",
        )

    token = create_access_token(
        data={"sub": db_user.email},
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@app.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


# =========================================================
# COACHES PÚBLICOS
# =========================================================

@app.get(
    "/coaches",
    response_model=list[CoachResponse],
)
def get_coaches(
    db: Session = Depends(get_db),
):
    return (
        db.query(Coach)
        .filter(Coach.active == True)
        .order_by(Coach.name.asc())
        .all()
    )


# =========================================================
# AGENDA AUTOMÁTICA
# =========================================================

@app.get(
    "/schedule",
    response_model=list[AutomaticSlotResponse],
)
def get_automatic_schedule(
    coach_id: int,
    start_date: date,
    days: int = 7,
    db: Session = Depends(get_db),
):
    if days < 1 or days > 31:
        raise HTTPException(
            status_code=400,
            detail="O período deve ter entre 1 e 31 dias",
        )

    coach = (
        db.query(Coach)
        .filter(
            Coach.id == coach_id,
            Coach.active == True,
        )
        .first()
    )

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado",
        )

    end_date = start_date + timedelta(days=days - 1)

    persisted_slots = (
        db.query(ClassSlot)
        .filter(
            ClassSlot.coach_id == coach_id,
            ClassSlot.date >= start_date,
            ClassSlot.date <= end_date,
        )
        .all()
    )

    slots_by_datetime = {
        (
            slot.date,
            normalize_schedule_time(slot.time),
        ): slot
        for slot in persisted_slots
    }

    persisted_slot_ids = [
        slot.id
        for slot in persisted_slots
    ]

    bookings_by_slot_id: dict[int, Booking] = {}

    if persisted_slot_ids:
        confirmed_bookings = (
            db.query(Booking)
            .options(joinedload(Booking.user))
            .filter(
                Booking.slot_id.in_(persisted_slot_ids),
                Booking.status == "confirmed",
            )
            .all()
        )

        bookings_by_slot_id = {
            booking.slot_id: booking
            for booking in confirmed_bookings
            if booking.slot_id is not None
        }

    schedule: list[dict] = []

    for day_offset in range(days):
        current_date = start_date + timedelta(
            days=day_offset,
        )

        start_hour, end_hour = get_business_hours(
            current_date,
        )

        for hour in range(start_hour, end_hour + 1):
            current_time = time(
                hour=hour,
                minute=0,
            )

            persisted_slot = slots_by_datetime.get(
                (
                    current_date,
                    current_time,
                )
            )

            # Horário automático ainda sem registro no banco.
            if not persisted_slot:
                schedule.append(
                    {
                        "slot_id": None,
                        "booking_id": None,
                        "coach_id": coach_id,
                        "date": current_date,
                        "time": current_time,
                        "status": "available",
                        "student_id": None,
                        "student_name": None,
                        "booking_type": None,
                        "spots": None,
                    }
                )
                continue

            # Slot existente, mas bloqueado pela administração.
            if not persisted_slot.active:
                schedule.append(
                    {
                        "slot_id": persisted_slot.id,
                        "booking_id": None,
                        "coach_id": coach_id,
                        "date": current_date,
                        "time": current_time,
                        "status": "blocked",
                        "student_id": None,
                        "student_name": None,
                        "booking_type": None,
                        "spots": None,
                    }
                )
                continue

            booking = bookings_by_slot_id.get(
                persisted_slot.id,
            )

            # Slot existente e reservado.
            if booking:
                schedule.append(
                    {
                        "slot_id": persisted_slot.id,
                        "booking_id": booking.id,
                        "coach_id": coach_id,
                        "date": current_date,
                        "time": current_time,
                        "status": "reserved",
                        "student_id": booking.user_id,
                        "student_name": (
                            booking.user.name
                            if booking.user
                            else "Aluna não encontrada"
                        ),
                        "booking_type": booking.booking_type,
                        "spots": booking.spots,
                    }
                )
                continue

            # Slot existente, ativo e sem reserva.
            schedule.append(
                {
                    "slot_id": persisted_slot.id,
                    "booking_id": None,
                    "coach_id": coach_id,
                    "date": current_date,
                    "time": current_time,
                    "status": "available",
                    "student_id": None,
                    "student_name": None,
                    "booking_type": None,
                    "spots": None,
                }
            )

    return schedule


# =========================================================
# RESERVAS
# =========================================================

@app.post(
    "/bookings",
    response_model=BookingResponse,
)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    slot = db.query(ClassSlot).filter(
        ClassSlot.id == booking.slot_id,
        ClassSlot.active == True,
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado",
        )

    slot_already_booked = db.query(Booking).filter(
        Booking.slot_id == booking.slot_id,
        Booking.status == "confirmed",
    ).first()

    if slot_already_booked:
        raise HTTPException(
            status_code=400,
            detail="Esse horário já foi reservado",
        )

    new_booking = Booking(
        user_id=current_user.id,
        slot_id=booking.slot_id,
        booking_type=booking.booking_type,
        spots=booking.spots,
        status="confirmed",
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


@app.post(
    "/bookings/automatic",
    response_model=BookingResponse,
)
def create_automatic_booking(
    booking_data: AutomaticBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    coach = db.query(Coach).filter(
        Coach.id == booking_data.coach_id,
        Coach.active == True,
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado",
        )

    if booking_data.date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Não é possível reservar uma data passada",
        )

    normalized_time = normalize_schedule_time(
        booking_data.time,
    )

    if booking_data.time != normalized_time:
        raise HTTPException(
            status_code=400,
            detail="As reservas devem ser feitas em horários fechados",
        )

    if not is_valid_business_time(
        booking_data.date,
        normalized_time,
    ):
        raise HTTPException(
            status_code=400,
            detail="Horário fora do funcionamento da academia",
        )

    slot = db.query(ClassSlot).filter(
        ClassSlot.coach_id == booking_data.coach_id,
        ClassSlot.date == booking_data.date,
        ClassSlot.time == normalized_time,
    ).first()

    if slot and not slot.active:
        raise HTTPException(
            status_code=400,
            detail="Esse horário está bloqueado",
        )

    if slot:
        existing_booking = db.query(Booking).filter(
            Booking.slot_id == slot.id,
            Booking.status == "confirmed",
        ).first()

        if existing_booking:
            raise HTTPException(
                status_code=400,
                detail="Esse horário já foi reservado",
            )

    if not slot:
        slot = ClassSlot(
            coach_id=booking_data.coach_id,
            date=booking_data.date,
            time=normalized_time,
            active=True,
        )

        db.add(slot)
        db.flush()

    new_booking = Booking(
        user_id=current_user.id,
        slot_id=slot.id,
        booking_type=booking_data.booking_type,
        spots=booking_data.spots,
        status="confirmed",
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


@app.get(
    "/bookings/me",
    response_model=list[BookingResponse],
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )


# =========================================================
# ADMIN — TESTE
# =========================================================

@app.get("/admin/test")
def admin_test(
    admin: User = Depends(get_current_admin),
):
    return {
        "message": "Você acessou uma rota de administrador",
        "admin": admin.email,
    }

# =========================================================
# ADMIN — ALUNAS
# =========================================================

@app.get(
    "/admin/users",
    response_model=list[UserResponse],
)
def admin_get_users(
    search: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(User).filter(
        User.is_admin == False,
    )

    if search:
        normalized_search = search.strip()

        query = query.filter(
            User.name.ilike(f"%{normalized_search}%")
            | User.email.ilike(f"%{normalized_search}%")
        )

    return query.order_by(User.name.asc()).all()

@app.post(
    "/admin/bookings",
    response_model=BookingResponse,
)
def admin_create_booking(
    booking_data: AdminBookingCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    student = db.query(User).filter(
        User.id == booking_data.user_id,
        User.is_admin == False,
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Aluna não encontrada",
        )

    coach = db.query(Coach).filter(
        Coach.id == booking_data.coach_id,
        Coach.active == True,
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado",
        )

    if booking_data.date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Não é possível reservar uma data passada",
        )

    normalized_time = normalize_schedule_time(
        booking_data.time,
    )

    if booking_data.time != normalized_time:
        raise HTTPException(
            status_code=400,
            detail="As reservas devem ser feitas em horários fechados",
        )

    if not is_valid_business_time(
        booking_data.date,
        normalized_time,
    ):
        raise HTTPException(
            status_code=400,
            detail="Horário fora do funcionamento da academia",
        )

    slot = db.query(ClassSlot).filter(
        ClassSlot.coach_id == booking_data.coach_id,
        ClassSlot.date == booking_data.date,
        ClassSlot.time == normalized_time,
    ).first()

    if slot and not slot.active:
        raise HTTPException(
            status_code=400,
            detail="Esse horário está bloqueado",
        )

    if slot:
        existing_booking = db.query(Booking).filter(
            Booking.slot_id == slot.id,
            Booking.status == "confirmed",
        ).first()

        if existing_booking:
            raise HTTPException(
                status_code=400,
                detail="Esse horário já possui uma reserva",
            )

    if not slot:
        slot = ClassSlot(
            coach_id=booking_data.coach_id,
            date=booking_data.date,
            time=normalized_time,
            active=True,
        )

        db.add(slot)
        db.flush()

    new_booking = Booking(
        user_id=student.id,
        slot_id=slot.id,
        booking_type=booking_data.booking_type,
        spots=booking_data.spots,
        status="confirmed",
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


# =========================================================
# ADMIN — CANCELAMENTO DE RESERVAS
# =========================================================

@app.put(
    "/admin/bookings/{booking_id}/cancel",
    response_model=BookingResponse,
)
def admin_cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Reserva não encontrada",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Essa reserva já está cancelada",
        )

    if booking.status != "confirmed":
        raise HTTPException(
            status_code=400,
            detail="Apenas reservas confirmadas podem ser canceladas",
        )

    booking.status = "cancelled"

    db.commit()
    db.refresh(booking)

    return booking

# =========================================================
# ADMIN — COACHES
# =========================================================

@app.post(
    "/admin/coaches",
    response_model=CoachResponse,
)
def create_coach(
    coach: CoachCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    new_coach = Coach(
        name=coach.name.strip(),
        specialty=coach.specialty.strip(),
        photo=coach.photo,
        active=coach.active,
    )

    db.add(new_coach)
    db.commit()
    db.refresh(new_coach)

    return new_coach


@app.get(
    "/admin/coaches",
    response_model=list[CoachResponse],
)
def admin_get_coaches(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return (
        db.query(Coach)
        .order_by(Coach.id.asc())
        .all()
    )


@app.put(
    "/admin/coaches/{coach_id}",
    response_model=CoachResponse,
)
def update_coach(
    coach_id: int,
    coach_data: CoachUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    coach = db.query(Coach).filter(
        Coach.id == coach_id,
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado",
        )

    if coach_data.name is not None:
        coach.name = coach_data.name.strip()

    if coach_data.specialty is not None:
        coach.specialty = coach_data.specialty.strip()

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
    admin: User = Depends(get_current_admin),
):
    coach = db.query(Coach).filter(
        Coach.id == coach_id,
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado",
        )

    coach.active = False

    db.commit()

    return {
        "message": "Coach inativado com sucesso",
    }

# =========================================================
# ADMIN — BLOQUEIOS DA AGENDA AUTOMÁTICA
# =========================================================

@app.post(
    "/admin/schedule/block",
    response_model=ClassSlotResponse,
)
def block_automatic_schedule_slot(
    slot_data: AutomaticSlotBlockCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    coach = db.query(Coach).filter(
        Coach.id == slot_data.coach_id,
        Coach.active == True,
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado",
        )

    normalized_time = normalize_schedule_time(slot_data.time)

    if slot_data.time != normalized_time:
        raise HTTPException(
            status_code=400,
            detail="O horário deve ter minutos iguais a 00",
        )

    if not is_valid_business_time(
        slot_data.date,
        normalized_time,
    ):
        raise HTTPException(
            status_code=400,
            detail="Horário fora do funcionamento da academia",
        )

    existing_slot = db.query(ClassSlot).filter(
        ClassSlot.coach_id == slot_data.coach_id,
        ClassSlot.date == slot_data.date,
        ClassSlot.time == normalized_time,
    ).first()

    if existing_slot:
        confirmed_booking = db.query(Booking).filter(
            Booking.slot_id == existing_slot.id,
            Booking.status == "confirmed",
        ).first()

        if confirmed_booking:
            raise HTTPException(
                status_code=400,
                detail="Não é possível bloquear um horário reservado",
            )

        existing_slot.active = False

        db.commit()
        db.refresh(existing_slot)

        return existing_slot

    blocked_slot = ClassSlot(
        coach_id=slot_data.coach_id,
        date=slot_data.date,
        time=normalized_time,
        active=False,
    )

    db.add(blocked_slot)
    db.commit()
    db.refresh(blocked_slot)

    return blocked_slot


@app.put(
    "/admin/schedule/{slot_id}/unblock",
    response_model=ClassSlotResponse,
)
def unblock_schedule_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    slot = db.query(ClassSlot).filter(
        ClassSlot.id == slot_id,
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado",
        )

    confirmed_booking = db.query(Booking).filter(
        Booking.slot_id == slot.id,
        Booking.status == "confirmed",
    ).first()

    if confirmed_booking:
        raise HTTPException(
            status_code=400,
            detail="Esse horário possui uma reserva confirmada",
        )

    slot.active = True

    db.commit()
    db.refresh(slot)

    return slot

# =========================================================
# ADMIN — HORÁRIOS PERSISTIDOS
# =========================================================

@app.post(
    "/admin/slots",
    response_model=ClassSlotResponse,
)
def create_slot(
    slot: ClassSlotCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    coach = db.query(Coach).filter(
        Coach.id == slot.coach_id,
        Coach.active == True,
    ).first()

    if not coach:
        raise HTTPException(
            status_code=404,
            detail="Coach não encontrado",
        )

    normalized_time = normalize_schedule_time(
        slot.time,
    )

    if slot.time != normalized_time:
        raise HTTPException(
            status_code=400,
            detail="O horário deve ter minutos iguais a 00",
        )

    if not is_valid_business_time(
        slot.date,
        normalized_time,
    ):
        raise HTTPException(
            status_code=400,
            detail="Horário fora do funcionamento da academia",
        )

    existing_slot = db.query(ClassSlot).filter(
        ClassSlot.coach_id == slot.coach_id,
        ClassSlot.date == slot.date,
        ClassSlot.time == normalized_time,
    ).first()

    if existing_slot:
        raise HTTPException(
            status_code=400,
            detail="Esse coach já possui esse horário cadastrado",
        )

    new_slot = ClassSlot(
        coach_id=slot.coach_id,
        date=slot.date,
        time=normalized_time,
        active=True,
    )

    db.add(new_slot)
    db.commit()
    db.refresh(new_slot)

    return new_slot


@app.get(
    "/admin/slots",
    response_model=list[ClassSlotResponse],
)
def admin_get_slots(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return (
        db.query(ClassSlot)
        .order_by(
            ClassSlot.date.asc(),
            ClassSlot.time.asc(),
        )
        .all()
    )


@app.put(
    "/admin/slots/{slot_id}",
    response_model=ClassSlotResponse,
)
def update_slot(
    slot_id: int,
    slot_data: ClassSlotUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    slot = db.query(ClassSlot).filter(
        ClassSlot.id == slot_id,
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado",
        )

    if slot_data.coach_id is not None:
        coach = db.query(Coach).filter(
            Coach.id == slot_data.coach_id,
            Coach.active == True,
        ).first()

        if not coach:
            raise HTTPException(
                status_code=404,
                detail="Coach não encontrado",
            )

        slot.coach_id = slot_data.coach_id

    if slot_data.date is not None:
        slot.date = slot_data.date

    if slot_data.time is not None:
        normalized_time = normalize_schedule_time(
            slot_data.time,
        )

        if slot_data.time != normalized_time:
            raise HTTPException(
                status_code=400,
                detail="O horário deve ter minutos iguais a 00",
            )

        slot.time = normalized_time

    if slot_data.active is not None:
        slot.active = slot_data.active

    if not is_valid_business_time(
        slot.date,
        slot.time,
    ):
        raise HTTPException(
            status_code=400,
            detail="Horário fora do funcionamento da academia",
        )

    conflicting_slot = db.query(ClassSlot).filter(
        ClassSlot.coach_id == slot.coach_id,
        ClassSlot.date == slot.date,
        ClassSlot.time == slot.time,
        ClassSlot.id != slot.id,
    ).first()

    if conflicting_slot:
        raise HTTPException(
            status_code=400,
            detail="Já existe um horário para esse coach nessa data e hora",
        )

    db.commit()
    db.refresh(slot)

    return slot


@app.delete("/admin/slots/{slot_id}")
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    slot = db.query(ClassSlot).filter(
        ClassSlot.id == slot_id,
    ).first()

    if not slot:
        raise HTTPException(
            status_code=404,
            detail="Horário não encontrado",
        )

    # Inativado significa bloqueado na agenda automática.
    slot.active = False

    db.commit()

    return {
        "message": "Horário bloqueado com sucesso",
    }


# =========================================================
# ROTA ANTIGA DE SLOTS
# Mantida temporariamente para não quebrar o frontend atual.
# =========================================================

@app.get(
    "/slots",
    response_model=list[ClassSlotResponse],
)
def get_available_slots(
    db: Session = Depends(get_db),
):
    return (
        db.query(ClassSlot)
        .filter(ClassSlot.active == True)
        .order_by(
            ClassSlot.date.asc(),
            ClassSlot.time.asc(),
        )
        .all()
    )