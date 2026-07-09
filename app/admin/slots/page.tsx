"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Coach = {
  id: number;
  name: string;
  specialty: string;
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

function getStartOfWeek(date: Date) {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  newDate.setDate(newDate.getDate() + diff);
  newDate.setHours(0, 0, 0, 0);

  return newDate;
}

function formatDateToInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export default function AdminSlotsPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  const [selectedDate, setSelectedDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        label: date
          .toLocaleDateString("pt-BR", { weekday: "short" })
          .replace(".", "")
          .toUpperCase(),
        day: date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        fullDate: formatDateToInput(date),
      };
    });
  }, [weekStart]);

  async function loadData() {
    const token = localStorage.getItem("token");

    const [coachesResponse, slotsResponse] = await Promise.all([
      fetch(`${API_URL}/coaches`),
      fetch(`${API_URL}/admin/slots`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    const coachesData = await coachesResponse.json();
    const slotsData = await slotsResponse.json();

    setCoaches(coachesData);
    setSlots(slotsData);

    if (!selectedCoachId && coachesData.length > 0) {
      setSelectedCoachId(String(coachesData[0].id));
    }
  }

useEffect(() => {
  async function start() {
    await loadData();
  }

  start();
}, []);

  const filteredSlots = slots.filter(
    (slot) => String(slot.coach_id) === selectedCoachId && slot.active
  );

  function getSlotsByDate(date: string) {
    return filteredSlots
      .filter((slot) => slot.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async function createSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        coach_id: Number(selectedCoachId),
        date: selectedDate,
        time: `${time}:00`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.detail || "Erro ao criar horário.");
      return;
    }

    setMessage("Horário criado com sucesso!");
    setSelectedDate("");
    setTime("");
    loadData();
  }

  async function deactivateSlot(slotId: number) {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/admin/slots/${slotId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadData();
  }

  function changeWeek(direction: "prev" | "next") {
    const newDate = new Date(weekStart);
    newDate.setDate(weekStart.getDate() + (direction === "next" ? 7 : -7));
    setWeekStart(newDate);
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-12">
      <section className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xl text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          ←
        </Link>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
          Painel administrativo
        </p>

        <h1 className="text-4xl font-black uppercase md:text-6xl">
          Agenda <span className="text-yellow-400">semanal</span>
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-black">Configurar agenda</h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-zinc-400">Coach</label>
              <select
                value={selectedCoachId}
                onChange={(event) => setSelectedCoachId(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
              >
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={createSlot} className="mt-6 border-t border-zinc-800 pt-6">
              <h3 className="font-bold">Novo horário</h3>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-zinc-400">Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-zinc-400">
                  Horário
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
                />
              </div>

              {message && (
                <p className="mt-4 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-300">
                  {message}
                </p>
              )}

              <button className="mt-5 w-full rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300">
                Criar horário
              </button>
            </form>
          </aside>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Semana do coach</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Visualize e gerencie os horários cadastrados.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => changeWeek("prev")}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  ← Semana
                </button>

                <button
                  onClick={() => setWeekStart(getStartOfWeek(new Date()))}
                  className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
                >
                  Hoje
                </button>

                <button
                  onClick={() => changeWeek("next")}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  Semana →
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-7">
              {weekDays.map((day) => {
                const daySlots = getSlotsByDate(day.fullDate);

                return (
                  <div
                    key={day.fullDate}
                    className="min-h-[230px] rounded-2xl border border-zinc-800 bg-black p-4"
                  >
                    <div className="border-b border-zinc-800 pb-3">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
                        {day.label}
                      </p>
                      <p className="mt-1 text-2xl font-black">{day.day}</p>
                    </div>

                    <div className="mt-4 space-y-2">
                      {daySlots.length === 0 && (
                        <p className="text-sm text-zinc-600">Sem horários</p>
                      )}

                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-yellow-400">
                              {formatTime(slot.time)}
                            </strong>

                            <button
                              onClick={() => deactivateSlot(slot.id)}
                              className="text-xs text-red-400 transition hover:text-red-300"
                            >
                              remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}