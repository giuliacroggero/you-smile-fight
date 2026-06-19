"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

const API_URL = "http://localhost:8000";

export default function MinhaContaPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    }

    loadUser();
  }, []);

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-12">
      <section className="mx-auto max-w-4xl">
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
          Minha <span className="text-yellow-400">conta</span>
        </h1>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          {user ? (
            <>
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-3xl font-black text-black">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <h2 className="text-3xl font-black">{user.name}</h2>

              <p className="mt-2 text-zinc-400">{user.email}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/minhas-reservas"
                  className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
                >
                  Ver minhas reservas
                </Link>

                <Link
                  href="/reservar"
                  className="rounded-xl border border-zinc-700 px-6 py-3 font-bold transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  Reservar aula
                </Link>
              </div>
            </>
          ) : (
            <p className="text-zinc-400">
              Você precisa estar logada para acessar sua conta.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}