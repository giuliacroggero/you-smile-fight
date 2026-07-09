"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

const API_URL = "http://localhost:8000";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Você precisa fazer login para acessar o admin.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setMessage("Sessão inválida. Faça login novamente.");
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (!data.is_admin) {
          setMessage("Acesso negado. Apenas administradores.");
          setLoading(false);
          return;
        }

        setUser(data);
      } catch {
        setMessage("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-zinc-400">Carregando painel...</p>
      </main>
    );
  }

  if (message) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <Link href="/" className="text-yellow-400">
          ← Voltar
        </Link>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-zinc-300">{message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-12">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-xl text-zinc-400 transition hover:border-yellow-400 hover:text-yellow-400"
        >
          ←
        </Link>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-yellow-400">
          Painel administrativo
        </p>

        <h1 className="text-4xl font-black uppercase md:text-6xl">
          Admin <span className="text-yellow-400">You Smile</span>
        </h1>

        <p className="mt-4 text-zinc-400">
          Bem-vinda, {user?.name}. Gerencie a operação da academia.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/coaches"
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-yellow-400"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-400">
              Equipe
            </p>
            <h2 className="mt-4 text-2xl font-black">Coaches</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Criar, editar e inativar professores.
            </p>
          </Link>

          <Link
            href="/admin/slots"
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-yellow-400"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-400">
              Agenda
            </p>
            <h2 className="mt-4 text-2xl font-black">Horários</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Cadastrar horários disponíveis.
            </p>
          </Link>

          <Link
            href="/admin/reservas"
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-yellow-400"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-400">
              Reservas
            </p>
            <h2 className="mt-4 text-2xl font-black">Aulas</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Ver reservas dos alunos.
            </p>
          </Link>

          <Link
            href="/admin/planos"
            className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-yellow-400"
          >
            <p className="text-sm uppercase tracking-[0.25em] text-yellow-400">
              Planos
            </p>
            <h2 className="mt-4 text-2xl font-black">Pagamentos</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Em breve: planos e cobranças.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}