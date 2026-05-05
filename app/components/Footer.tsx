export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 border-t border-gray-800 px-10 py-14">

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">

        {/* ESQUERDA */}
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logoyou.png" alt="logo" className="w-10 h-10" />
            <div>
              <h2 className="text-white font-semibold">
                YOU SMILE FIGHT
              </h2>
              <p className="text-yellow-400 text-xs tracking-wide">
                SWEAT • SMILE • REPEAT
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed">
            Mais que um treino. <br />
            Uma comunidade que te puxa para frente. <br />
            Energia, disciplina e evolução.
          </p>
        </div>

        {/* LINHA DIVISÓRIA */}
        <div className="hidden md:block w-px bg-yellow-400/30"></div>

        {/* NAVEGAÇÃO */}
        <div>
          <h3 className="text-yellow-400 font-semibold mb-4">
            NAVEGAÇÃO
          </h3>

          <ul className="space-y-3">
            {["TREINOS", "PLANOS", "RESERVAR", "SOBRE NÓS"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="flex justify-between items-center hover:text-white transition"
                >
                  {item}
                  <span className="text-yellow-400">›</span>
                </a>

                <div className="h-px bg-yellow-400/20 mt-2"></div>
              </li>
            ))}
          </ul>
        </div>

        {/* LINHA DIVISÓRIA */}
        <div className="hidden md:block w-px bg-yellow-400/30"></div>

        {/* CONTATO */}
        <div>
          <h3 className="text-yellow-400 font-semibold mb-4">
            FALE CONOSCO
          </h3>

          <div className="space-y-4 text-sm">

            <p>
              📍 Rua Baluarte, 31 - Vila Olímpia <br />
              São Paulo - SP
            </p>

            <p>📱 (11) 93947-8819</p>

            <p>📸 @yousmilefight</p>

          </div>
        </div>

      </div>

      {/* LINHA FINAL */}
      <div className="border-t border-yellow-400/30 mt-10 pt-6 flex flex-col md:flex-row justify-between text-xs text-gray-500 gap-4">

        <p>
          © 2026 You Smile Fight — Todos os direitos reservados.
        </p>

        <div className="flex gap-4">
          <a href="#">Política de Privacidade</a>
          <span>•</span>
          <a href="#">Termos de Uso</a>
          <span>•</span>
          <a href="#">Cookies</a>
        </div>

      </div>

    </footer>
  );
}