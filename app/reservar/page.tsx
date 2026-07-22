"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Period = "todos" | "manha" | "tarde" | "noite";

type SlotStatus = "available" | "reserved" | "blocked";

type Coach = {
  id: number;
  name: string;
  specialty: string;
  photo: string | null;
  active: boolean;
};

type AutomaticSlot = {
  slot_id: number | null;
  booking_id: number | null;
  coach_id: number;
  date: string;
  time: string;
  status: SlotStatus;
};

type WeekDay = {
  index: number;
  fullDate: string;
  label: string;
  day: string;
  month: string;
};

const API_URL = "http://localhost:8000";

const periods: { id: Period; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "manha", label: "Manhã" },
  { id: "tarde", label: "Tarde" },
  { id: "noite", label: "Noite" },
];

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDays(): WeekDay[] {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);

    date.setHours(12, 0, 0, 0);
    date.setDate(today.getDate() + index);

    return {
      index,
      fullDate: formatDateForApi(date),
      label: date
        .toLocaleDateString("pt-BR", {
          weekday: "short",
        })
        .replace(".", "")
        .toUpperCase(),
      day: String(date.getDate()).padStart(2, "0"),
      month: date
        .toLocaleDateString("pt-BR", {
          month: "short",
        })
        .replace(".", "")
        .toUpperCase(),
    };
  });
}

function getPeriodByTime(
  timeValue: string,
): Exclude<Period, "todos"> {
  const hour = Number(timeValue.slice(0, 2));

  if (hour < 12) return "manha";
  if (hour < 18) return "tarde";

  return "noite";
}

function formatTime(timeValue: string) {
  return timeValue.slice(0, 5);
}

function getSlotLabel(status: SlotStatus) {
  if (status === "reserved") return "Reservado";
  if (status === "blocked") return "Bloqueado";

  return "Disponível";
}

export default function ReservarPage() {
  const router = useRouter();

  const weekDays = useMemo(() => getWeekDays(), []);

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [schedule, setSchedule] = useState<AutomaticSlot[]>([]);

  const [selectedCoach, setSelectedCoach] = useState("");
  const [selectedPeriod, setSelectedPeriod] =
    useState<Period>("todos");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] =
    useState<AutomaticSlot | null>(null);

  const [message, setMessage] = useState("");
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const selectedDate = weekDays.find(
    (day) => day.index === selectedDay,
  );

  const selectedCoachData = coaches.find(
    (coach) => String(coach.id) === selectedCoach,
  );

  useEffect(() => {
    async function loadCoaches() {
      try {
        setMessage("");

        const response = await fetch(`${API_URL}/coaches`);

        if (!response.ok) {
          throw new Error("Não foi possível carregar os coaches.");
        }

        const data: Coach[] = await response.json();

        setCoaches(data);

        if (data.length > 0) {
          setSelectedCoach(String(data[0].id));
        }
      } catch {
        setMessage("Erro ao carregar os coaches.");
      } finally {
        setLoadingCoaches(false);
      }
    }

    loadCoaches();
  }, []);

  useEffect(() => {
    if (!selectedCoach || weekDays.length === 0) {
      return;
    }

    async function loadSchedule() {
      try {
        setLoadingSchedule(true);
        setSelectedSlot(null);
        setMessage("");

        const params = new URLSearchParams({
          coach_id: selectedCoach,
          start_date: weekDays[0].fullDate,
          days: "7",
        });

        const response = await fetch(
          `${API_URL}/schedule?${params.toString()}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Não foi possível carregar a agenda.",
          );
        }

        setSchedule(data);
      } catch (error) {
        setSchedule([]);

        setMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar a agenda.",
        );
      } finally {
        setLoadingSchedule(false);
      }
    }

    loadSchedule();
  }, [selectedCoach, weekDays]);

  const slotsForSelectedDay = schedule
    .filter((slot) => slot.date === selectedDate?.fullDate)
    .filter((slot) =>
      selectedPeriod === "todos"
        ? true
        : getPeriodByTime(slot.time) === selectedPeriod,
    )
    .sort((firstSlot, secondSlot) =>
      firstSlot.time.localeCompare(secondSlot.time),
    );

  const availableSlots = slotsForSelectedDay.filter(
    (slot) => slot.status === "available",
  );

  async function confirmBooking() {
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Você precisa fazer login para reservar.");
      return;
    }

    if (!selectedSlot) {
      setMessage("Selecione um horário disponível.");
      return;
    }

    if (selectedSlot.status !== "available") {
      setMessage("Esse horário não está disponível.");
      return;
    }

    try {
      setConfirming(true);

      const response = await fetch(
        `${API_URL}/bookings/automatic`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coach_id: selectedSlot.coach_id,
            date: selectedSlot.date,
            time: selectedSlot.time,
            booking_type: "individual",
            spots: 1,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Erro ao confirmar a reserva.",
        );
        return;
      }

      router.push("/minhas-reservas");
    } catch {
      setMessage("Erro ao conectar com o servidor.");
    } finally {
      setConfirming(false);
    }
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
          Escolha o coach, o dia e veja os horários disponíveis
          da semana.
        </p>

        {loadingCoaches ? (
          <p className="mt-10 text-zinc-400">
            Carregando coaches...
          </p>
        ) : coaches.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-6">
            <p className="text-sm text-zinc-400">
              Nenhum coach disponível no momento.
            </p>
          </div>
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
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name} — {coach.specialty}
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
                    const isActive =
                      selectedPeriod === period.id;

                    return (
                      <button
                        key={period.id}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(period.id);
                          setSelectedSlot(null);
                          setMessage("");
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
                  const isActive =
                    selectedDay === day.index;

                  return (
                    <button
                      key={day.fullDate}
                      type="button"
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
                Horários da agenda
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Os horários livres podem ser reservados diretamente.
              </p>
            </div>

            {loadingSchedule ? (
              <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-6">
                <p className="text-sm text-zinc-400">
                  Carregando agenda...
                </p>
              </div>
            ) : slotsForSelectedDay.length > 0 ? (
              <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-4 backdrop-blur">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-8">
                  {slotsForSelectedDay.map((slot) => {
                    const slotKey = `${slot.date}-${slot.time}`;
                    const selectedSlotKey = selectedSlot
                      ? `${selectedSlot.date}-${selectedSlot.time}`
                      : null;

                    const isActive =
                      selectedSlotKey === slotKey;

                    const isAvailable =
                      slot.status === "available";

                    return (
                      <button
                        key={slotKey}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setMessage("");
                        }}
                        className={`rounded-2xl border p-4 text-center transition ${
                          isActive
                            ? "border-yellow-400 bg-yellow-400 text-black"
                            : slot.status === "available"
                              ? "border-yellow-400/70 bg-black text-white hover:bg-yellow-400 hover:text-black"
                              : slot.status === "reserved"
                                ? "cursor-not-allowed border-red-500/30 bg-red-500/10 text-zinc-500"
                                : "cursor-not-allowed border-zinc-700 bg-zinc-900 text-zinc-600"
                        }`}
                      >
                        <div
                          className={`mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                            isActive
                              ? "border-black text-black"
                              : slot.status === "available"
                                ? "border-yellow-400 text-yellow-400"
                                : slot.status === "reserved"
                                  ? "border-red-400/50 text-red-400"
                                  : "border-zinc-600 text-zinc-600"
                          }`}
                        >
                          ⏱
                        </div>

                        <strong className="block text-2xl font-black">
                          {formatTime(slot.time)}
                        </strong>

                        <span
                          className={`mt-2 block text-sm font-bold ${
                            isActive
                              ? "text-black/70"
                              : slot.status === "available"
                                ? "text-green-400"
                                : slot.status === "reserved"
                                  ? "text-red-400"
                                  : "text-zinc-500"
                          }`}
                        >
                          {getSlotLabel(slot.status)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[2rem] border border-zinc-800 bg-zinc-950/50 p-6">
                <p className="text-sm text-zinc-400">
                  Nenhum horário encontrado para esse coach neste
                  dia ou período.
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
                      {selectedCoachData?.name} •{" "}
                      {selectedDate?.label},{" "}
                      {selectedDate?.day}{" "}
                      {selectedDate?.month} •{" "}
                      <span className="text-yellow-400">
                        {formatTime(selectedSlot.time)}
                      </span>
                    </p>

                    {message && (
                      <p className="mt-2 text-sm text-red-400">
                        {message}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={confirmBooking}
                    disabled={confirming}
                    className="rounded-2xl bg-yellow-400 px-7 py-4 text-sm font-black uppercase text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {confirming
                      ? "Confirmando..."
                      : "Confirmar reserva"}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-yellow-400/50 text-yellow-400">
                      📅
                    </div>

                    <p className="text-zinc-300">
                      Selecione um horário disponível para continuar
                      com sua reserva.
                    </p>
                  </div>

                  {message && (
                    <p className="mt-3 text-sm text-red-400">
                      {message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              {availableSlots.length} horário
              {availableSlots.length === 1 ? "" : "s"} disponível
              {availableSlots.length === 1 ? "" : "is"} neste período.
            </p>
          </>
        )}
      </section>
    </main>
  );
}