"use client";

import { useState } from "react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
};

const API_URL = "http://localhost:8000";

export default function AuthModal({ isOpen, onClose, type }: AuthModalProps) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = type === "login" ? "/login" : "/register";

      const body =
        type === "login"
          ? { email, password }
          : {
              name: `${name} ${lastName}`.trim(),
              email,
              password,
            };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Erro ao processar solicitação.");
        return;
      }

      if (type === "login") {
        localStorage.setItem("token", data.access_token);
        setMessage("Login realizado com sucesso!");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 700);
      } else {
        setMessage("Conta criada com sucesso! Agora faça login.");
      }
    } catch {
      setMessage("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[390px] rounded-[24px] border border-gray-800 bg-[#0a0a0a] p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-500 transition hover:text-white"
        >
          ✕
        </button>

        <div className="mb-5">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-yellow-400">
            YOU SMILE FIGHT
          </p>

          <h2 className="mb-3 text-2xl font-bold">
            {type === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>

          <p className="text-sm text-gray-400">
            {type === "login"
              ? "Entre para acessar sua área."
              : "Comece sua evolução hoje."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {type === "register" && (
            <>
              <div>
                <label className="mb-1.5 block text-xs text-gray-400">
                  Nome
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 outline-none transition focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-400">
                  Sobrenome
                </label>
                <input
                  type="text"
                  placeholder="Seu sobrenome"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 outline-none transition focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-gray-400">
                  Telefone
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 outline-none transition focus:border-yellow-400"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-xs text-gray-400">Email</label>
            <input
              type="email"
              placeholder="seuemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 outline-none transition focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-gray-400">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 outline-none transition focus:border-yellow-400"
            />
          </div>

          {message && (
            <p className="rounded-xl border border-gray-800 bg-black px-4 py-2 text-sm text-gray-300">
              {message}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 py-2.5 font-semibold text-black transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "CARREGANDO..."
              : type === "login"
                ? "ENTRAR"
                : "CRIAR CONTA"}
          </button>
        </form>
      </div>
    </div>
  );
}