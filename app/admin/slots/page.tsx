"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Coach = {
  id: number;
  name: string;
  specialty: string;
  active: boolean;
};

type Student = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

type ScheduleStatus = "available" | "reserved" | "blocked";

type ScheduleSlot = {
  slot_id: number | null;
  booking_id: number | null;
  coach_id: number;
  date: string;
  time: string;
  status: ScheduleStatus;
  student_id: number | null;
  student_name: string | null;
  booking_type: string | null;
  spots: number | null;
};

type MessageType = "success" | "error" | "";

const API_URL = "http://localhost:8000";

const bookingTypes = [
  {
    value: "individual",
    label: "Aula individual",
  },
  {
    value: "dupla",
    label: "Aula em dupla",
  },
  {
    value: "experimental",
    label: "Aula experimental",
  },
  {
    value: "single_class",
    label: "Aula avulsa",
  },
];

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const weekday = result.getDay();
  const difference = weekday === 0 ? -6 : 1 - weekday;

  result.setDate(result.getDate() + difference);
  result.setHours(12, 0, 0, 0);

  return result;
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(value?: string | null) {
  if (!value) {
    return "--:--";
  }

  return value.slice(0, 5);
}

function formatFullDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(status: ScheduleStatus) {
  const labels: Record<ScheduleStatus, string> = {
    available: "Disponível",
    reserved: "Reservado",
    blocked: "Bloqueado",
  };

  return labels[status];
}

function getBookingTypeLabel(value?: string | null) {
  if (!value) {
    return "Tipo não informado";
  }

  const bookingType = bookingTypes.find(
    (item) => item.value === value,
  );

  return bookingType?.label ?? value;
}

export default function AdminSlotsPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);

  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [weekStart, setWeekStart] = useState(
    getStartOfWeek(new Date()),
  );

  const [selectedSlot, setSelectedSlot] =
    useState<ScheduleSlot | null>(null);

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [bookingType, setBookingType] =
    useState("individual");
  const [spots, setSpots] = useState(1);

  const [loadingCoaches, setLoadingCoaches] =
    useState(true);
  const [loadingStudents, setLoadingStudents] =
    useState(false);
  const [loadingSchedule, setLoadingSchedule] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<MessageType>("");

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const currentDate = new Date(weekStart);

      currentDate.setDate(weekStart.getDate() + index);
      currentDate.setHours(12, 0, 0, 0);

      return {
        fullDate: formatDateForApi(currentDate),
        weekday: currentDate
          .toLocaleDateString("pt-BR", {
            weekday: "short",
          })
          .replace(".", "")
          .toUpperCase(),
        dayAndMonth: currentDate.toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "2-digit",
          },
        ),
      };
    });
  }, [weekStart]);

  const selectedCoach = coaches.find(
    (coach) => String(coach.id) === selectedCoachId,
  );

  const filteredStudents = useMemo(() => {
    const search = studentSearch.trim().toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search),
    );
  }, [students, studentSearch]);

  const loadSchedule = useCallback(async () => {
    if (!selectedCoachId) {
      return;
    }

    try {
      setLoadingSchedule(true);
      setMessage("");
      setMessageType("");

      const params = new URLSearchParams({
        coach_id: selectedCoachId,
        start_date: formatDateForApi(weekStart),
        days: "7",
      });

      const response = await fetch(
        `${API_URL}/schedule?${params.toString()}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível carregar a agenda.",
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

      setMessageType("error");
    } finally {
      setLoadingSchedule(false);
    }
  }, [selectedCoachId, weekStart]);

  useEffect(() => {
    async function loadCoaches() {
      try {
        const response = await fetch(`${API_URL}/coaches`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar os coaches.",
          );
        }

        setCoaches(data);

        if (data.length > 0) {
          setSelectedCoachId(String(data[0].id));
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar os coaches.",
        );

        setMessageType("error");
      } finally {
        setLoadingCoaches(false);
      }
    }

    loadCoaches();
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  function getSlotsByDate(date: string) {
    return schedule
      .filter((slot) => slot.date === date)
      .sort((firstSlot, secondSlot) =>
        firstSlot.time.localeCompare(secondSlot.time),
      );
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setSelectedSlot(null);
    setSelectedStudentId("");
    setStudentSearch("");
    setBookingType("individual");
    setSpots(1);
  }

  async function openSlotModal(slot: ScheduleSlot) {
    setSelectedSlot(slot);
    setSelectedStudentId("");
    setStudentSearch("");
    setBookingType("individual");
    setSpots(1);
    setMessage("");
    setMessageType("");

    if (slot.status !== "available") {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Sua sessão expirou. Faça login novamente.");
      setMessageType("error");
      return;
    }

    if (students.length > 0) {
      return;
    }

    try {
      setLoadingStudents(true);

      const response = await fetch(
        `${API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível carregar as alunas.",
        );
      }

      setStudents(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao carregar as alunas.",
      );

      setMessageType("error");
    } finally {
      setLoadingStudents(false);
    }
  }

  async function createAdminBooking() {
    if (!selectedSlot) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Sua sessão expirou. Faça login novamente.");
      setMessageType("error");
      return;
    }

    if (!selectedStudentId) {
      setMessage("Selecione uma aluna.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/admin/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: Number(selectedStudentId),
            coach_id: selectedSlot.coach_id,
            date: selectedSlot.date,
            time: selectedSlot.time,
            booking_type: bookingType,
            spots,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível criar a reserva.",
        );
      }

      closeModal();

      setMessage("Reserva criada com sucesso.");
      setMessageType("success");

      await loadSchedule();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao criar a reserva.",
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function blockSelectedSlot() {
    if (!selectedSlot) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Sua sessão expirou. Faça login novamente.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/admin/schedule/block`,
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
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível bloquear o horário.",
        );
      }

      closeModal();

      setMessage(
        `Horário ${formatTime(
          selectedSlot.time,
        )} bloqueado com sucesso.`,
      );

      setMessageType("success");

      await loadSchedule();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao bloquear o horário.",
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function unblockSelectedSlot() {
    if (!selectedSlot?.slot_id) {
      setMessage(
        "Esse horário bloqueado não possui identificação.",
      );
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Sua sessão expirou. Faça login novamente.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/admin/schedule/${selectedSlot.slot_id}/unblock`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível desbloquear o horário.",
        );
      }

      closeModal();

      setMessage("Horário desbloqueado com sucesso.");
      setMessageType("success");

      await loadSchedule();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao desbloquear o horário.",
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  async function cancelSelectedBooking() {
    if (!selectedSlot?.booking_id) {
      setMessage("Essa reserva não possui identificação.");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Sua sessão expirou. Faça login novamente.");
      setMessageType("error");
      return;
    }

    const confirmed = window.confirm(
      `Deseja cancelar a reserva de ${
        selectedSlot.student_name ?? "esta aluna"
      } em ${formatTime(selectedSlot.time)}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_URL}/admin/bookings/${selectedSlot.booking_id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Não foi possível cancelar a reserva.",
        );
      }

      closeModal();

      setMessage("Reserva cancelada com sucesso.");
      setMessageType("success");

      await loadSchedule();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao cancelar a reserva.",
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }
  function changeWeek(direction: "previous" | "next") {
    const newWeek = new Date(weekStart);

    newWeek.setDate(
      weekStart.getDate() +
        (direction === "next" ? 7 : -7),
    );

    setWeekStart(newWeek);
    setSelectedSlot(null);
    setMessage("");
    setMessageType("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black px-5 py-10 text-white md:px-12">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-yellow-400/10 blur-[120px]" />

      <section className="relative mx-auto max-w-[1500px]">
        <Link
          href="/admin"
          aria-label="Voltar ao painel administrativo"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xl text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          ←
        </Link>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
          Painel administrativo
        </p>

        <h1 className="text-4xl font-black uppercase md:text-6xl">
          Agenda{" "}
          <span className="text-yellow-400">
            semanal
          </span>
        </h1>

        <p className="mt-4 max-w-3xl text-zinc-400">
          Clique em um horário para reservar uma aula,
          bloquear, desbloquear ou consultar os detalhes.
        </p>

        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-sm">
            <label className="mb-2 block text-sm font-bold uppercase text-zinc-400">
              Coach
            </label>

            <select
              value={selectedCoachId}
              disabled={loadingCoaches}
              onChange={(event) => {
                setSelectedCoachId(event.target.value);
                setSelectedSlot(null);
                setMessage("");
                setMessageType("");
              }}
              className="h-14 w-full rounded-xl border border-zinc-800 bg-black px-4 font-semibold outline-none transition focus:border-yellow-400 disabled:opacity-60"
            >
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name} — {coach.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => changeWeek("previous")}
              className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold transition hover:border-yellow-400 hover:text-yellow-400"
            >
              ← Semana
            </button>

            <button
              type="button"
              onClick={() => {
                setWeekStart(getStartOfWeek(new Date()));
                setSelectedSlot(null);
                setMessage("");
                setMessageType("");
              }}
              className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() => changeWeek("next")}
              className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-semibold transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Semana →
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-2xl border px-5 py-4 text-sm ${
              messageType === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            Disponível
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            Reservado
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <span className="h-3 w-3 rounded-full bg-zinc-600" />
            Bloqueado
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 md:p-5">
          <div className="min-w-[1180px]">
            <div className="mb-5">
              <h2 className="text-xl font-black">
                {selectedCoach?.name ??
                  "Agenda do coach"}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Semana iniciando em{" "}
                {weekStart.toLocaleDateString("pt-BR")}
              </p>
            </div>

            {loadingSchedule ? (
              <div className="rounded-2xl border border-zinc-800 bg-black p-8">
                <p className="text-zinc-400">
                  Carregando agenda...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-3">
                {weekDays.map((day) => {
                  const daySlots = getSlotsByDate(
                    day.fullDate,
                  );

                  return (
                    <div
                      key={day.fullDate}
                      className="rounded-2xl border border-zinc-800 bg-black p-3"
                    >
                      <div className="border-b border-zinc-800 pb-3 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                          {day.weekday}
                        </p>

                        <p className="mt-1 text-xl font-black">
                          {day.dayAndMonth}
                        </p>
                      </div>

                      <div className="mt-3 space-y-2">
                        {daySlots.map((slot) => {
                          const isReserved =
                            slot.status === "reserved";

                          return (
                            <button
                              key={`${slot.date}-${slot.time}`}
                              type="button"
                              onClick={() =>
                                openSlotModal(slot)
                              }
                              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                                slot.status === "available"
                                  ? "border-yellow-400/40 bg-yellow-400/10 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
                                  : isReserved
                                    ? "border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400"
                                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-green-400 hover:text-green-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-base">
                                  {formatTime(slot.time)}
                                </strong>

                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    slot.status === "available"
                                      ? "bg-yellow-400"
                                      : isReserved
                                        ? "bg-red-500"
                                        : "bg-zinc-600"
                                  }`}
                                />
                              </div>

                              <div className="mt-2">
                                {isReserved ? (
                                  <>
                                    <p className="truncate text-xs font-bold text-white">
                                      {slot.student_name ??
                                        "Aluna"}
                                    </p>

                                    <p className="text-[11px] text-red-300">
                                      {getBookingTypeLabel(
                                        slot.booking_type,
                                      )}
                                    </p>

                                    <p className="text-[10px] text-zinc-400">
                                      {slot.spots ?? 1}{" "}
                                      {(slot.spots ?? 1) === 1
                                        ? "participante"
                                        : "participantes"}
                                    </p>
                                  </>
                                ) : (
                                  <span className="text-[11px] font-semibold">
                                    {getStatusLabel(
                                      slot.status,
                                    )}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                  Agenda administrativa
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {formatTime(selectedSlot.time)} •{" "}
                  {selectedCoach?.name}
                </h2>

                <p className="mt-2 capitalize text-zinc-400">
                  {formatFullDate(selectedSlot.date)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
              >
                ✕
              </button>
            </div>

            {selectedSlot.status === "available" && (
              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Pesquisar aluna
                  </label>

                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(event) =>
                      setStudentSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Nome ou e-mail"
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 outline-none transition focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Aluna
                  </label>

                  <select
                    value={selectedStudentId}
                    onChange={(event) =>
                      setSelectedStudentId(
                        event.target.value,
                      )
                    }
                    disabled={loadingStudents}
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 outline-none transition focus:border-yellow-400 disabled:opacity-60"
                  >
                    <option value="">
                      {loadingStudents
                        ? "Carregando..."
                        : "Selecione uma aluna"}
                    </option>

                    {filteredStudents.map((student) => (
                      <option
                        key={student.id}
                        value={student.id}
                      >
                        {student.name} — {student.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Tipo da aula
                  </label>

                  <select
                    value={bookingType}
                    onChange={(event) =>
                      setBookingType(
                        event.target.value,
                      )
                    }
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 outline-none transition focus:border-yellow-400"
                  >
                    {bookingTypes.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-300">
                    Participantes
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={spots}
                    onChange={(event) => {
                      const value = Number(
                        event.target.value,
                      );

                      setSpots(
                        Math.min(
                          5,
                          Math.max(1, value || 1),
                        ),
                      );
                    }}
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 outline-none transition focus:border-yellow-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={createAdminBooking}
                  disabled={saving || loadingStudents}
                  className="w-full rounded-xl bg-yellow-400 px-5 py-4 font-black uppercase text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Salvando..."
                    : "Confirmar reserva"}
                </button>

                <div className="border-t border-zinc-800 pt-5">
                  <button
                    type="button"
                    onClick={blockSelectedSlot}
                    disabled={saving}
                    className="w-full rounded-xl border border-zinc-700 px-5 py-3 font-bold text-zinc-300 transition hover:border-red-400 hover:text-red-400 disabled:opacity-60"
                  >
                    Bloquear este horário
                  </button>
                </div>
              </div>
            )}

            {selectedSlot.status === "reserved" && (
              <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                  Reserva confirmada
                </p>

                <h3 className="mt-3 text-2xl font-black">
                  {selectedSlot.student_name ??
                    "Aluna não informada"}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-zinc-400">
                  <p>
                    Tipo:{" "}
                    <strong className="text-white">
                      {getBookingTypeLabel(
                        selectedSlot.booking_type,
                      )}
                    </strong>
                  </p>

                  <p>
                    Participantes:{" "}
                    <strong className="text-white">
                      {selectedSlot.spots ?? 1}
                    </strong>
                  </p>

                  <p>
                    Código da reserva:{" "}
                    <strong className="text-white">
                      {selectedSlot.booking_id}
                    </strong>
                  </p>
                </div>
                <div className="mt-6 border-t border-red-500/20 pt-5">
                  <button
                    type="button"
                    onClick={cancelSelectedBooking}
                    disabled={saving}
                    className="w-full rounded-xl border border-red-500/50 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Cancelando..."
                      : "Cancelar reserva"}
                  </button>
                </div>
              </div>
            )}

            {selectedSlot.status === "blocked" && (
              <div className="mt-7">
                <div className="rounded-2xl border border-zinc-700 bg-black p-5">
                  <p className="text-sm text-zinc-400">
                    Este horário está bloqueado e não
                    aparece como disponível para as alunas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={unblockSelectedSlot}
                  disabled={saving}
                  className="mt-4 w-full rounded-xl bg-green-500 px-5 py-4 font-black uppercase text-black transition hover:bg-green-400 disabled:opacity-60"
                >
                  {saving
                    ? "Liberando..."
                    : "Desbloquear horário"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}