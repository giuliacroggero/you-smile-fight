import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-black/90 px-6 py-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-3">
        <img
          src="/logoyou.png"
          alt="Logo You Smile Fight"
          className="h-14 w-14 object-contain"
        />

        <div>
          <h1 className="font-semibold tracking-normal text-white">
            YOU SMILE FIGHT
          </h1>
          <p className="text-[11px] tracking-wide text-yellow-400">
            SWEAT • SMILE • REPEAT
          </p>
        </div>
      </Link>

      <nav className="hidden gap-8 text-sm font-light tracking-tight text-white md:flex">
        <a href="#treinos" className="transition hover:text-yellow-400">
          TREINOS
        </a>

        <a href="#planos" className="transition hover:text-yellow-400">
          PLANOS
        </a>

        <a href="#sobre" className="transition hover:text-yellow-400">
          SOBRE NÓS
        </a>
      </nav>

      <a
        href="https://wa.me/5511939478812?text=Olá!%20Tenho%20interesse%20nos%20treinos%20da%20You%20Smile%20Fight."
        target="_blank"
        rel="noopener noreferrer"
        className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:scale-105 hover:bg-yellow-300"
      >
        AGENDAR AULA
      </a>
    </header>
  );
}