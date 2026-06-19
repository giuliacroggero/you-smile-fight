"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Booking = {
  id: number;
  user_id: number;
  coach_id: number;
  date: string;
  time: string;
  status: string;
};

type Coach = {
  id: number;
  name: string;
  specialty: string;
};

const API_URL = "http://localhost:8000";

export default function MinhasReservasPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
        const [bookingsResponse, coachesResponse] = await Promise.all([
          fetch(`${API_URL}/bookings/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/coaches`),
        ]);

        if (!bookingsResponse.ok) {
          setMessage("Não foi possível carregar suas reservas.");
          setLoading(false);
          return;
        }

        const bookingsData = await bookingsResponse.json();
        const coachesData = await coachesResponse.json();

        setBookings(bookingsData);
        setCoaches(coachesData);
      } catch {
        setMessage("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function getCoachName(coachId: number) {
    const coach = coaches.find((item) => item.id === coachId);
    return coach ? coach.name : "Coach";
  }

  function formatDate(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(time: string) {
    return time.slice(0, 5);
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-12">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xl text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          ←
        </Link>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
          Área do aluno
        </p>

        <h1 className="text-4xl font-black uppercase md:text-6xl">
          Minhas <span className="text-yellow-400">reservas</span>
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Acompanhe suas aulas agendadas na You Smile Fight.
        </p>

        {loading && (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Carregando reservas...</p>
          </div>
        )}

        {!loading && message && (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">{message}</p>
          </div>
        )}

        {!loading && !message && bookings.length === 0 && (
          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-2xl font-bold">Nenhuma reserva encontrada</h2>

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

        {!loading && !message && bookings.length > 0 && (
          <div className="mt-10 grid gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-yellow-400"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-yellow-400">
                      {booking.status === "confirmed"
                        ? "Confirmada"
                        : booking.status}
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {getCoachName(booking.coach_id)}
                    </h2>

                    <p className="mt-2 text-zinc-400">
                      {formatDate(booking.date)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/40 bg-black px-6 py-4 text-center">
                    <p className="text-sm text-zinc-500">Horário</p>
                    <strong className="text-3xl text-yellow-400">
                      {formatTime(booking.time)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}