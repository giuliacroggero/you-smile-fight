export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-black border-b border-gray-800">

      {/* LOGO */}
      <div className="flex items-center gap-3">
        <img src="/logoyou.png" alt="logo" className="w-14 h-14 object-contain" />
        <div>
          <h1 className="font-semibold tracking-normal">YOU SMILE FIGHT</h1>
          <p className="text-[11px] text-yellow-400 tracking-wide">
            SWEAT • SMILE • REPEAT
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex gap-8 text-sm font-light tracking-tight">
        <a href="#">TREINOS</a>
        <a href="#">PLANOS</a>
        <a href="#">RESERVAR</a>
        <a href="#">SOBRE NÓS</a>
      </nav>

      {/* BOTÕES */}
      <div className="flex items-center gap-2">
        <button className="border border-yellow-400 px-4 py-2 rounded">
          LOGIN
        </button>

        <button className="bg-yellow-400 text-black px-4 py-2 rounded">
          CADASTRE-SE
        </button>
      </div>

    </header>
    
  );
}