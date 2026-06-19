"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Period = "todos" | "manha" | "tarde" | "noite";

type Coach = {
  id: string;
  name: string;
  role: string;
};

type Schedule = {
  coachId: string;
  dayIndex: number;
  period: Exclude<Period, "todos">;
  times: string[];
};

const coaches: Coach[] = [
  { id: "matheus", name: "Matheus Sales", role: "Muay Thai e Funcional Fight" },
  { id: "luiz", name: "Luiz", role: "Boxe e Condicionamento" },
  { id: "adriel", name: "Adriel", role: "Funcional e Defesa Pessoal" },
];

const periods: { id: Period; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "manha", label: "Manhã" },
  { id: "tarde", label: "Tarde" },
  { id: "noite", label: "Noite" },
];

const schedules: Schedule[] = [
  {
    coachId: "matheus",
    dayIndex: 0,
    period: "manha",
    times: ["06:00", "07:00", "08:00", "09:00", "10:00"],
  },
  {
    coachId: "matheus",
    dayIndex: 0,
    period: "noite",
    times: ["17:00", "18:00", "19:00", "20:00"],
  },
  {
    coachId: "matheus",
    dayIndex: 1,
    period: "manha",
    times: ["07:00", "08:00", "09:00"],
  },
  {
    coachId: "matheus",
    dayIndex: 2,
    period: "noite",
    times: ["18:00", "19:00", "20:00"],
  },
  {
    coachId: "matheus",
    dayIndex: 4,
    period: "tarde",
    times: ["15:00", "16:00"],
  },

  {
    coachId: "luiz",
    dayIndex: 0,
    period: "tarde",
    times: ["14:00", "15:00", "16:00"],
  },
  {
    coachId: "luiz",
    dayIndex: 1,
    period: "noite",
    times: ["18:00", "19:00", "20:00"],
  },
  {
    coachId: "luiz",
    dayIndex: 3,
    period: "manha",
    times: ["08:00", "09:00", "10:00"],
  },
  {
    coachId: "luiz",
    dayIndex: 5,
    period: "manha",
    times: ["10:00", "11:00"],
  },

  {
    coachId: "adriel",
    dayIndex: 1,
    period: "manha",
    times: ["06:00", "07:00", "08:00"],
  },
  {
    coachId: "adriel",
    dayIndex: 2,
    period: "tarde",
    times: ["14:00", "16:00"],
  },
  {
    coachId: "adriel",
    dayIndex: 3,
    period: "noite",
    times: ["18:00", "19:00"],
  },
  {
    coachId: "adriel",
    dayIndex: 6,
    period: "manha",
    times: ["09:00", "10:00"],
  },
];

function getWeekDays() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      index,
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

function getVacancies(time: string) {
  return ["10:00", "19:00"].includes(time) ? 1 : 2;
}

export default function ReservarPage() {
  const [selectedCoach, setSelectedCoach] = useState(coaches[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("todos");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");

  const weekDays = useMemo(() => getWeekDays(), []);
  const coach = coaches.find((item) => item.id === selectedCoach);
  const selectedDate = weekDays.find((day) => day.index === selectedDay);

  const availableTimes = schedules
    .filter((item) => item.coachId === selectedCoach)
    .filter((item) => item.dayIndex === selectedDay)
    .filter((item) =>
      selectedPeriod === "todos" ? true : item.period === selectedPeriod
    )
    .flatMap((item) => item.times);

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

        <div className="mt-8 max-w-xl">
          <label className="mb-3 block text-sm font-bold uppercase text-zinc-400">
            Coach
          </label>

          <select
            value={selectedCoach}
            onChange={(event) => {
              setSelectedCoach(event.target.value);
              setSelectedTime("");
            }}
            className="h-16 w-full rounded-2xl border border-zinc-800 bg-black px-5 text-base font-semibold text-white outline-none transition focus:border-yellow-400"
          >
            {coaches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.role}
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
                      setSelectedTime("");
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
                    setSelectedTime("");
                  }}
                  className={`h-28 rounded-2xl border text-center transition ${
                    isActive
                      ? "border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.12)]"
                      : "border-zinc-800 bg-black text-white hover:border-yellow-400"
                  }`}
                >
                  <span className="block text-sm font-black">{day.label}</span>
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
            50 min <span className="text-yellow-400">•</span> Funcional Fight{" "}
            <span className="text-yellow-400">•</span> 2 vagas por horário
          </p>
        </div>

        {availableTimes.length > 0 ? (
          <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-4 backdrop-blur">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-9">
              {availableTimes.map((time) => {
                const isActive = selectedTime === time;
                const vacancies = getVacancies(time);

                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
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
                      {time}
                    </strong>

                    <span
                      className={`mt-2 block text-sm font-bold ${
                        isActive
                          ? "text-black/70"
                          : vacancies === 1
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {vacancies} {vacancies === 1 ? "vaga" : "vagas"}
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
          {selectedTime ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-400">Reserva selecionada</p>
                <p className="mt-1 text-lg font-bold">
                  {coach?.name} • {selectedDate?.label}, {selectedDate?.day}{" "}
                  {selectedDate?.month} •{" "}
                  <span className="text-yellow-400">{selectedTime}</span>
                </p>
              </div>

              <button className="rounded-2xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase text-black transition hover:bg-yellow-300">
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
      </section>
    </main>
  );
}