from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
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

    name = Column(String, nullable=False)

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    password = Column(String, nullable=False)

    is_admin = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    bookings = relationship(
        "Booking",
        back_populates="user",
    )

    student_plans = relationship(
        "StudentPlan",
        back_populates="user",
    )


# =========================================================
# COACHES
# =========================================================

class Coach(Base):
    __tablename__ = "coaches"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    specialty = Column(
        String,
        nullable=False,
        default="Coach",
    )

    photo = Column(String, nullable=True)

    active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    slots = relationship(
        "ClassSlot",
        back_populates="coach",
    )


# =========================================================
# HORÁRIOS
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

    date = Column(
        Date,
        nullable=False,
        index=True,
    )

    time = Column(
        Time,
        nullable=False,
    )

    active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

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

    # Continua opcional temporariamente por causa
    # das reservas antigas.
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

    credit_transactions = relationship(
        "CreditTransaction",
        back_populates="booking",
    )


# =========================================================
# PLANOS DISPONÍVEIS
# =========================================================

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False,
    )

    # Exemplos:
    # individual
    # dupla
    # totalpass
    # wellhub
    code = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    # Exemplos:
    # academy
    # partner
    plan_type = Column(
        String,
        nullable=False,
        default="academy",
    )

    # Quantidade de créditos liberados por ciclo.
    credits_per_cycle = Column(
        Integer,
        nullable=False,
        default=0,
    )

    # Quantos dias futuros a aluna pode visualizar/reservar.
    # TotalPass, por exemplo, pode usar 7.
    booking_window_days = Column(
        Integer,
        nullable=False,
        default=30,
    )

    # Quantidade de meses de duração do ciclo.
    cycle_months = Column(
        Integer,
        nullable=False,
        default=1,
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    student_plans = relationship(
        "StudentPlan",
        back_populates="plan",
    )


# =========================================================
# PLANO CONTRATADO PELA ALUNA
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

    start_date = Column(
        Date,
        nullable=False,
    )

    end_date = Column(
        Date,
        nullable=True,
    )

    active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
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
    )


# =========================================================
# CICLOS DE CRÉDITOS
# =========================================================

class CreditCycle(Base):
    __tablename__ = "credit_cycles"

    __table_args__ = (
        UniqueConstraint(
            "student_plan_id",
            "start_date",
            name="uq_credit_cycle_student_plan_start",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    student_plan_id = Column(
        Integer,
        ForeignKey("student_plans.id"),
        nullable=False,
        index=True,
    )

    start_date = Column(
        Date,
        nullable=False,
    )

    end_date = Column(
        Date,
        nullable=False,
    )

    credits_total = Column(
        Integer,
        nullable=False,
        default=0,
    )

    credits_used = Column(
        Integer,
        nullable=False,
        default=0,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    student_plan = relationship(
        "StudentPlan",
        back_populates="credit_cycles",
    )

    transactions = relationship(
        "CreditTransaction",
        back_populates="credit_cycle",
    )

    @property
    def credits_remaining(self) -> int:
        return max(
            0,
            self.credits_total - self.credits_used,
        )


# =========================================================
# HISTÓRICO DE MOVIMENTAÇÃO DOS CRÉDITOS
# =========================================================

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)

    credit_cycle_id = Column(
        Integer,
        ForeignKey("credit_cycles.id"),
        nullable=False,
        index=True,
    )

    # Pode ser nulo em ajustes manuais feitos pelo admin.
    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=True,
        index=True,
    )

    # Exemplos:
    # booking_debit
    # cancellation_refund
    # admin_credit
    # admin_debit
    transaction_type = Column(
        String,
        nullable=False,
    )

    # -1 consome um crédito.
    # +1 devolve/adiciona um crédito.
    amount = Column(
        Integer,
        nullable=False,
    )

    description = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    credit_cycle = relationship(
        "CreditCycle",
        back_populates="transactions",
    )

    booking = relationship(
        "Booking",
        back_populates="credit_transactions",
    )