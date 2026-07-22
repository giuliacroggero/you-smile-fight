"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Booking = {
  id: number;
  user_id: number;
  slot_id: number | null;
  booking_type: string;
  spots: number;
  status: string;
};

type ClassSlot = {
  id: number;
  coach_id: number;
  date: string;
  time: string;
  active: boolean;
};

type Coach = {
  id: number;
  name: string;
  specialty: string;
};

type BookingWithDetails = Booking & {
  slot: ClassSlot | null;
  coach: Coach | null;
};

const API_URL = "http://localhost:8000";

function formatDate(date?: string | null) {
  if (!date) {
    return "Data não informada";
  }

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }

  return parsedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time?: string | null) {
  if (!time) {
    return "--:--";
  }

  return time.slice(0, 5);
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Concluída",
    no_show: "Falta",
    rescheduled: "Remarcada",
  };

  return labels[status] ?? status;
}

function getStatusClasses(status: string) {
  const classes: Record<string, string> = {
    confirmed: "text-green-400",
    cancelled: "text-red-400",
    completed: "text-blue-400",
    no_show: "text-orange-400",
    rescheduled: "text-yellow-400",
  };

  return classes[status] ?? "text-zinc-400";
}

function getBookingTypeLabel(bookingType: string) {
  const labels: Record<string, string> = {
    individual: "Aula individual",
    dupla: "Aula em dupla",
    plan_individual: "Plano individual",
    plan_duo: "Plano em dupla",
    experimental: "Aula experimental",
    single_class: "Aula avulsa",
    totalpass: "TotalPass",
    wellhub: "Wellhub",
    courtesy: "Cortesia",
  };

  return labels[bookingType] ?? bookingType;
}

export default function MinhasReservasPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Você precisa fazer login para ver suas reservas.");
        setLoading(false);
        return;
      }

      try {
        setMessage("");

        const [
          bookingsResponse,
          slotsResponse,
          coachesResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/bookings/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/slots`),
          fetch(`${API_URL}/coaches`),
        ]);

        if (bookingsResponse.status === 401) {
          localStorage.removeItem("token");
          setMessage("Sua sessão expirou. Faça login novamente.");
          return;
        }

        if (!bookingsResponse.ok) {
          const errorData = await bookingsResponse
            .json()
            .catch(() => null);

          throw new Error(
            errorData?.detail ||
              "Não foi possível carregar suas reservas.",
          );
        }

        if (!slotsResponse.ok) {
          throw new Error(
            "Não foi possível carregar os horários das reservas.",
          );
        }

        if (!coachesResponse.ok) {
          throw new Error(
            "Não foi possível carregar os dados dos coaches.",
          );
        }

        const bookingsData: Booking[] =
          await bookingsResponse.json();

        const slotsData: ClassSlot[] =
          await slotsResponse.json();

        const coachesData: Coach[] =
          await coachesResponse.json();

        setBookings(bookingsData);
        setSlots(slotsData);
        setCoaches(coachesData);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Erro ao conectar com o servidor.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const bookingsWithDetails = useMemo<BookingWithDetails[]>(() => {
    return bookings.map((booking) => {
      const slot =
        booking.slot_id !== null
          ? slots.find((item) => item.id === booking.slot_id) ??
            null
          : null;

      const coach = slot
        ? coaches.find((item) => item.id === slot.coach_id) ??
          null
        : null;

      return {
        ...booking,
        slot,
        coach,
      };
    });
  }, [bookings, slots, coaches]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-5 py-10 text-white md:px-12">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-yellow-400/10 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-yellow-400/10 blur-[120px]" />

      <section className="relative mx-auto max-w-5xl">
        <Link
          href="/"
          aria-label="Voltar para a página inicial"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xl text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          ←
        </Link>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
          Área do aluno
        </p>

        <h1 className="text-4xl font-black uppercase md:text-6xl">
          Minhas{" "}
          <span className="text-yellow-400">reservas</span>
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Acompanhe suas aulas agendadas na You Smile Fight.
        </p>

        {loading && (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              Carregando reservas...
            </p>
          </div>
        )}

        {!loading && message && (
          <div className="mt-10 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-red-300">{message}</p>

            <Link
              href="/"
              className="mt-5 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
              Voltar ao início
            </Link>
          </div>
        )}

        {!loading &&
          !message &&
          bookingsWithDetails.length === 0 && (
            <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
              <h2 className="text-2xl font-bold">
                Nenhuma reserva encontrada
              </h2>

              <p className="mt-2 text-zinc-400">
                Você ainda não possui aulas agendadas.
              </p>

              <Link
                href="/reservar"
                className="mt-6 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
              >
                Reservar aula
              </Link>
            </div>
          )}

        {!loading &&
          !message &&
          bookingsWithDetails.length > 0 && (
            <div className="mt-10 grid gap-4">
              {bookingsWithDetails.map((booking) => {
                const hasSlotDetails = Boolean(booking.slot);

                return (
                  <article
                    key={booking.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-yellow-400"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p
                          className={`text-sm font-bold uppercase tracking-[0.25em] ${getStatusClasses(
                            booking.status,
                          )}`}
                        >
                          {getStatusLabel(booking.status)}
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                          {booking.coach?.name ??
                            "Coach não informado"}
                        </h2>

                        {booking.coach?.specialty && (
                          <p className="mt-1 text-sm text-zinc-500">
                            {booking.coach.specialty}
                          </p>
                        )}

                        <p className="mt-4 text-zinc-300">
                          {formatDate(booking.slot?.date)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400">
                            {getBookingTypeLabel(
                              booking.booking_type,
                            )}
                          </span>

                          <span className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400">
                            {booking.spots}{" "}
                            {booking.spots === 1
                              ? "participante"
                              : "participantes"}
                          </span>
                        </div>

                        {!hasSlotDetails && (
                          <p className="mt-4 text-sm text-orange-400">
                            Esta é uma reserva antiga e não possui
                            horário vinculado.
                          </p>
                        )}
                      </div>

                      <div className="min-w-36 rounded-2xl border border-yellow-400/40 bg-black px-6 py-4 text-center">
                        <p className="text-sm text-zinc-500">
                          Horário
                        </p>

                        <strong className="text-3xl text-yellow-400">
                          {formatTime(booking.slot?.time)}
                        </strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}