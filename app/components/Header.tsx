"use client";

import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";

type User = {
  id: number;
  name: string;
  email: string;
};

const API_URL = "http://localhost:8000";

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    setIsMenuOpen(false);
    window.location.reload();
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-gray-800 bg-black px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/logoyou.png"
            alt="logo"
            className="h-14 w-14 object-contain"
          />

          <div>
            <h1 className="font-semibold tracking-normal">YOU SMILE FIGHT</h1>
            <p className="text-[11px] tracking-wide text-yellow-400">
              SWEAT • SMILE • REPEAT
            </p>
          </div>
        </div>

        <nav className="hidden gap-8 text-sm font-light tracking-tight md:flex">
          <a href="#treinos" className="transition hover:text-yellow-400">
            TREINOS
          </a>
          <a href="#planos" className="transition hover:text-yellow-400">
            PLANOS
          </a>
          <a href="/reservar" className="transition hover:text-yellow-400">
            RESERVAR
          </a>
          <a href="#sobre" className="transition hover:text-yellow-400">
            SOBRE NÓS
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 rounded-full border border-gray-800 px-4 py-2 transition hover:border-yellow-400"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 font-bold text-black">
                  {user.name.charAt(0).toUpperCase()}
                </span>

                <span className="hidden text-sm font-semibold md:block">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-gray-800 bg-zinc-950 p-3 shadow-2xl">
                  <p className="px-3 py-2 text-xs text-gray-400">
                    Logado como
                  </p>

                  <p className="truncate px-3 pb-3 text-sm font-semibold">
                    {user.email}
                  </p>

                  <a
                  href="/minha-conta"
                  className="block rounded-xl px-3 py-2 text-sm transition hover:bg-yellow-400 hover:text-black"
                >
                  Minha conta
                </a>

                <a
                  href="/minhas-reservas"
                  className="mt-1 block rounded-xl px-3 py-2 text-sm transition hover:bg-yellow-400 hover:text-black"
                >
                  Minhas reservas
                </a>

                <button
                  onClick={handleLogout}
                  className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500 hover:text-white"
                >
                  Sair
                </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="rounded border border-yellow-400 px-4 py-2 transition hover:bg-yellow-400 hover:text-black"
              >
                LOGIN
              </button>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="rounded bg-yellow-400 px-4 py-2 text-black transition hover:scale-105"
              >
                CADASTRE-SE
              </button>
            </>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        type="login"
      />

      <AuthModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        type="register"
      />
    </>
  );
}