from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# =========================================================
# USUÁRIOS
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    phone = Column(String(30), nullable=True)
    birth_date = Column(Date, nullable=True)

    # Mantido para não quebrar o sistema atual
    is_admin = Column(Boolean, default=False, nullable=False)

    # Novos perfis:
    # admin | reception | coach | student
    role = Column(String(30), default="student", nullable=False)

    active = Column(Boolean, default=True, nullable=False)
    internal_notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    bookings = relationship(
        "Booking",
        back_populates="user",
        foreign_keys="Booking.user_id",
    )

    student_plans = relationship(
        "StudentPlan",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    credit_cycles = relationship(
        "CreditCycle",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# =========================================================
# PROFESSORES
# =========================================================

class Coach(Base):
    __tablename__ = "coaches"

    id = Column(Integer, primary_key=True, index=True)

    # Opcional: permite ligar um professor a um usuário com login
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        unique=True,
    )

    name = Column(String(150), nullable=False)
    specialty = Column(String(150), nullable=False, default="Coach")
    photo = Column(String(500), nullable=True)

    active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", foreign_keys=[user_id])

    slots = relationship(
        "ClassSlot",
        back_populates="coach",
    )

    availability_rules = relationship(
        "AvailabilityRule",
        back_populates="coach",
        cascade="all, delete-orphan",
    )

    recurring_bookings = relationship(
        "RecurringBooking",
        back_populates="coach",
    )


# =========================================================
# PLANOS
# =========================================================

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(120), nullable=False)

    # academy_individual | academy_duo | totalpass | wellhub
    # experimental | single_class | courtesy
    plan_type = Column(String(50), nullable=False)

    description = Column(Text, nullable=True)

    credits_per_cycle = Column(Integer, nullable=True)

    # Quantos dias futuros a aluna pode visualizar/reservar
    booking_window_days = Column(Integer, default=30, nullable=False)

    price = Column(Numeric(10, 2), nullable=True)

    active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    student_plans = relationship(
        "StudentPlan",
        back_populates="plan",
    )


# =========================================================
# PLANO ATIVO DA ALUNA
# =========================================================

class StudentPlan(Base):
    __tablename__ = "student_plans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    plan_id = Column(
        Integer,
        ForeignKey("plans.id"),
        nullable=False,
        index=True,
    )

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    # pending | active | paused | expired | cancelled
    status = Column(String(30), default="active", nullable=False)

    # Permite personalizar créditos sem alterar o plano padrão
    custom_credits = Column(Integer, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="student_plans",
    )

    plan = relationship(
        "Plan",
        back_populates="student_plans",
    )

    credit_cycles = relationship(
        "CreditCycle",
        back_populates="student_plan",
        cascade="all, delete-orphan",
    )


# =========================================================
# CICLOS DE CRÉDITOS
# =========================================================

class CreditCycle(Base):
    __tablename__ = "credit_cycles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    student_plan_id = Column(
        Integer,
        ForeignKey("student_plans.id"),
        nullable=False,
        index=True,
    )

    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)

    credits_total = Column(Integer, nullable=False)
    credits_used = Column(Integer, default=0, nullable=False)

    active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="credit_cycles",
    )

    student_plan = relationship(
        "StudentPlan",
        back_populates="credit_cycles",
    )


# =========================================================
# REGRAS DE DISPONIBILIDADE
# =========================================================

class AvailabilityRule(Base):
    __tablename__ = "availability_rules"

    id = Column(Integer, primary_key=True, index=True)

    coach_id = Column(
        Integer,
        ForeignKey("coaches.id"),
        nullable=False,
        index=True,
    )

    # Python: segunda = 0 e domingo = 6
    weekday = Column(Integer, nullable=False)

    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Exemplo: horários de 60 em 60 minutos
    interval_minutes = Column(Integer, default=60, nullable=False)

    active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    coach = relationship(
        "Coach",
        back_populates="availability_rules",
    )

    __table_args__ = (
        UniqueConstraint(
            "coach_id",
            "weekday",
            "start_time",
            "end_time",
            name="uq_coach_availability_rule",
        ),
    )


# =========================================================
# AULAS FIXAS / RECORRENTES
# =========================================================

class RecurringBooking(Base):
    __tablename__ = "recurring_bookings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    coach_id = Column(
        Integer,
        ForeignKey("coaches.id"),
        nullable=False,
        index=True,
    )

    weekday = Column(Integer, nullable=False)
    time = Column(Time, nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    booking_type = Column(
        String(50),
        default="plan_individual",
        nullable=False,
    )

    participant_count = Column(Integer, default=1, nullable=False)

    active = Column(Boolean, default=True, nullable=False)

    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User")
    coach = relationship(
        "Coach",
        back_populates="recurring_bookings",
    )

    generated_slots = relationship(
        "ClassSlot",
        back_populates="recurring_booking",
    )


# =========================================================
# HORÁRIOS REAIS DA AGENDA
# =========================================================

class ClassSlot(Base):
    __tablename__ = "class_slots"

    id = Column(Integer, primary_key=True, index=True)

    coach_id = Column(
        Integer,
        ForeignKey("coaches.id"),
        nullable=False,
        index=True,
    )

    recurring_booking_id = Column(
        Integer,
        ForeignKey("recurring_bookings.id"),
        nullable=True,
        index=True,
    )

    date = Column(Date, nullable=False, index=True)
    time = Column(Time, nullable=False)

    duration_minutes = Column(Integer, default=60, nullable=False)

    # available | reserved | blocked | cancelled | completed
    status = Column(String(30), default="available", nullable=False)

    # automatic | admin | recurring
    source = Column(String(30), default="automatic", nullable=False)

    active = Column(Boolean, default=True, nullable=False)

    block_reason = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    coach = relationship(
        "Coach",
        back_populates="slots",
    )

    recurring_booking = relationship(
        "RecurringBooking",
        back_populates="generated_slots",
    )

    bookings = relationship(
        "Booking",
        back_populates="slot",
    )

    __table_args__ = (
        UniqueConstraint(
            "coach_id",
            "date",
            "time",
            name="uq_coach_slot_datetime",
        ),
    )


# =========================================================
# RESERVAS
# =========================================================

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    slot_id = Column(
        Integer,
        ForeignKey("class_slots.id"),
        nullable=True,
        index=True,
    )

    student_plan_id = Column(
        Integer,
        ForeignKey("student_plans.id"),
        nullable=True,
        index=True,
    )

    credit_cycle_id = Column(
        Integer,
        ForeignKey("credit_cycles.id"),
        nullable=True,
        index=True,
    )

    # plan_individual | plan_duo | totalpass | wellhub
    # experimental | single_class | courtesy | residential | event
    booking_type = Column(
        String(50),
        default="plan_individual",
        nullable=False,
    )

    # Mantido temporariamente para compatibilidade
    spots = Column(Integer, default=1, nullable=False)

    participant_count = Column(Integer, default=1, nullable=False)

    # confirmed | cancelled | completed | no_show | rescheduled
    status = Column(String(30), default="confirmed", nullable=False)

    # student | admin | reception
    created_by_type = Column(String(30), default="student", nullable=False)

    created_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
    )

    notes = Column(Text, nullable=True)

    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    completed_at = Column(DateTime(timezone=True), nullable=True)

    credit_consumed = Column(Boolean, default=False, nullable=False)
    credit_returned = Column(Boolean, default=False, nullable=False)

    total_price = Column(Numeric(10, 2), nullable=True)
    price_per_person = Column(Numeric(10, 2), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="bookings",
        foreign_keys=[user_id],
    )

    created_by_user = relationship(
        "User",
        foreign_keys=[created_by_user_id],
    )

    slot = relationship(
        "ClassSlot",
        back_populates="bookings",
    )

    student_plan = relationship("StudentPlan")
    credit_cycle = relationship("CreditCycle")

    participants = relationship(
        "BookingParticipant",
        back_populates="booking",
        cascade="all, delete-orphan",
    )


# =========================================================
# PARTICIPANTES DA AULA
# =========================================================

class BookingParticipant(Base):
    __tablename__ = "booking_participants"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=False,
        index=True,
    )

    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    booking = relationship(
        "Booking",
        back_populates="participants",
    )