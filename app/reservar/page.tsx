"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Period = "todos" | "manha" | "tarde" | "noite";

type Coach = {
  id: number;
  name: string;
  specialty: string;
  photo: string | null;
  active: boolean;
};

type Slot = {
  id: number;
  coach_id: number;
  date: string;
  time: string;
  active: boolean;
};

const API_URL = "http://localhost:8000";

const periods: { id: Period; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "manha", label: "Manhã" },
  { id: "tarde", label: "Tarde" },
  { id: "noite", label: "Noite" },
];

function getWeekDays() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      index,
      fullDate: date.toISOString().split("T")[0],
      label: date
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", "")
        .toUpperCase(),
      day: String(date.getDate()).padStart(2, "0"),
      month: date
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "")
        .toUpperCase(),
    };
  });
}

function getPeriodByTime(time: string): Exclude<Period, "todos"> {
  const hour = Number(time.slice(0, 2));

  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";
  return "noite";
}

function formatTime(time: string) {
  return time.slice(0, 5);
}

export default function ReservarPage() {
  const router = useRouter();

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("todos");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => getWeekDays(), []);
  const selectedDate = weekDays.find((day) => day.index === selectedDay);
  const coach = coaches.find((item) => String(item.id) === selectedCoach);

  useEffect(() => {
    async function loadData() {
      try {
        const [coachesResponse, slotsResponse] = await Promise.all([
          fetch(`${API_URL}/coaches`),
          fetch(`${API_URL}/slots`),
        ]);

        const coachesData = await coachesResponse.json();
        const slotsData = await slotsResponse.json();

        setCoaches(coachesData);
        setSlots(slotsData);

        if (coachesData.length > 0) {
          setSelectedCoach(String(coachesData[0].id));
        }
      } catch {
        setMessage("Erro ao carregar horários.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const availableSlots = slots
    .filter((slot) => String(slot.coach_id) === selectedCoach)
    .filter((slot) => slot.date === selectedDate?.fullDate)
    .filter((slot) =>
      selectedPeriod === "todos"
        ? true
        : getPeriodByTime(slot.time) === selectedPeriod
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  async function confirmBooking() {
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Você precisa fazer login para reservar.");
      return;
    }

    if (!selectedSlot) {
      setMessage("Selecione um horário.");
      return;
    }

    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        slot_id: selectedSlot.id,
        booking_type: "individual",
        spots: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.detail || "Erro ao confirmar reserva.");
      return;
    }

    router.push("/minhas-reservas");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-5 py-8 text-white md:px-12 md:py-10">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-yellow-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-yellow-400/10 blur-[120px]" />

      <section className="relative mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xl text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          ←
        </Link>

        <div className="flex items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
            Agenda
          </p>
          <span className="h-px w-14 bg-yellow-400" />
        </div>

        <h1 className="mt-5 text-4xl font-black uppercase leading-none tracking-tight md:text-6xl">
          Reserve <span className="text-yellow-400">sua aula</span>
        </h1>

        <p className="mt-4 max-w-2xl text-base text-zinc-400 md:text-lg">
          Escolha o coach, o dia e veja os horários disponíveis da semana.
        </p>

        {loading ? (
          <p className="mt-10 text-zinc-400">Carregando horários...</p>
        ) : (
          <>
            <div className="mt-8 max-w-xl">
              <label className="mb-3 block text-sm font-bold uppercase text-zinc-400">
                Coach
              </label>

              <select
                value={selectedCoach}
                onChange={(event) => {
                  setSelectedCoach(event.target.value);
                  setSelectedSlot(null);
                  setMessage("");
                }}
                className="h-16 w-full rounded-2xl border border-zinc-800 bg-black px-5 text-base font-semibold text-white outline-none transition focus:border-yellow-400"
              >
                {coaches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-7 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-5 backdrop-blur md:p-6">
              <div className="flex flex-col gap-5 border-b border-zinc-800 pb-5 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold uppercase text-zinc-400">
                  Selecione o dia
                </p>

                <div className="flex flex-wrap gap-2">
                  {periods.map((period) => {
                    const isActive = selectedPeriod === period.id;

                    return (
                      <button
                        key={period.id}
                        onClick={() => {
                          setSelectedPeriod(period.id);
                          setSelectedSlot(null);
                        }}
                        className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                          isActive
                            ? "border-yellow-400 bg-yellow-400 text-black"
                            : "border-zinc-800 bg-black text-zinc-300 hover:border-yellow-400 hover:text-white"
                        }`}
                      >
                        {period.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {weekDays.map((day) => {
                  const isActive = selectedDay === day.index;

                  return (
                    <button
                      key={day.index}
                      onClick={() => {
                        setSelectedDay(day.index);
                        setSelectedSlot(null);
                        setMessage("");
                      }}
                      className={`h-28 rounded-2xl border text-center transition ${
                        isActive
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                          : "border-zinc-800 bg-black text-white hover:border-yellow-400"
                      }`}
                    >
                      <span className="block text-sm font-black">
                        {day.label}
                      </span>
                      <strong className="mt-2 block text-4xl leading-none">
                        {day.day}
                      </strong>
                      <span className="mt-2 block text-xs font-bold text-zinc-400">
                        {day.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7">
              <h2 className="text-2xl font-black uppercase">
                Horários disponíveis
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Aulas personalizadas com reserva por horário.
              </p>
            </div>

            {availableSlots.length > 0 ? (
              <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-4 backdrop-blur">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9">
                  {availableSlots.map((slot) => {
                    const isActive = selectedSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setMessage("");
                        }}
                        className={`rounded-2xl border p-4 text-center transition ${
                          isActive
                            ? "border-yellow-400 bg-yellow-400 text-black"
                            : "border-yellow-400/70 bg-black text-white hover:bg-yellow-400 hover:text-black"
                        }`}
                      >
                        <div
                          className={`mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                            isActive
                              ? "border-black text-black"
                              : "border-yellow-400 text-yellow-400"
                          }`}
                        >
                          ⏱
                        </div>

                        <strong className="block text-2xl font-black">
                          {formatTime(slot.time)}
                        </strong>

                        <span
                          className={`mt-2 block text-sm font-bold ${
                            isActive ? "text-black/70" : "text-green-400"
                          }`}
                        >
                          Disponível
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-6">
                <p className="text-sm text-zinc-400">
                  Nenhum horário disponível para esse coach neste dia/período.
                </p>
              </div>
            )}

            <div className="mt-4 rounded-[2rem] border border-zinc-800 bg-black/80 p-5">
              {selectedSlot ? (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">
                      Reserva selecionada
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      {coach?.name} • {selectedDate?.label},{" "}
                      {selectedDate?.day} {selectedDate?.month} •{" "}
                      <span className="text-yellow-400">
                        {formatTime(selectedSlot.time)}
                      </span>
                    </p>

                    {message && (
                      <p className="mt-2 text-sm text-red-400">{message}</p>
                    )}
                  </div>

                  <button
                    onClick={confirmBooking}
                    className="rounded-2xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase text-black transition hover:bg-yellow-300"
                  >
                    Confirmar reserva
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-400/50 text-yellow-400">
                    📅
                  </div>

                  <p className="text-zinc-300">
                    Selecione um horário para continuar com sua reserva.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}