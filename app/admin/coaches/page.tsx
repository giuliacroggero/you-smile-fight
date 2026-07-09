"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Coach = {
  id: number;
  name: string;
  specialty: string;
  photo: string | null;
  active: boolean;
};

const API_URL = "http://localhost:8000";

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Coach");
  const [message, setMessage] = useState("");

  async function loadCoaches() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/coaches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setCoaches(data);
  }

  useEffect(() => {
    loadCoaches();
  }, []);

  async function createCoach(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/admin/coaches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        specialty,
        photo: null,
        active: true,
      }),
    });

    if (!response.ok) {
      setMessage("Erro ao criar coach.");
      return;
    }

    setName("");
    setSpecialty("Coach");
    setMessage("Coach criado com sucesso!");
    loadCoaches();
  }

  async function deactivateCoach(coachId: number) {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/admin/coaches/${coachId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadCoaches();
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-12">
      <section className="mx-auto max-w-6xl">
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
          Gerenciar <span className="text-yellow-400">coaches</span>
        </h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={createCoach}
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <h2 className="text-2xl font-black">Novo coach</h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-zinc-400">Nome</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
                placeholder="Nome do coach"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-zinc-400">
                Especialidade
              </label>
              <input
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-yellow-400"
                placeholder="Ex: Funcional Fight"
              />
            </div>

            {message && (
              <p className="mt-4 rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-300">
                {message}
              </p>
            )}

            <button className="mt-5 w-full rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300">
              Criar coach
            </button>
          </form>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-2xl font-black">Coaches cadastrados</h2>

            <div className="mt-5 grid gap-3">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-black p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-lg font-black">{coach.name}</p>
                    <p className="text-sm text-zinc-400">{coach.specialty}</p>
                    <p
                      className={`mt-2 text-xs font-bold uppercase tracking-[0.2em] ${
                        coach.active ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {coach.active ? "Ativo" : "Inativo"}
                    </p>
                  </div>

                  {coach.active && (
                    <button
                      onClick={() => deactivateCoach(coach.id)}
                      className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      Inativar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}