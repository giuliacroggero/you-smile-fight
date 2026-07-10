export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black px-6 py-14 text-gray-400 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-10 md:flex-row">
        {/* IDENTIDADE */}
        <div className="max-w-sm">
          <div className="mb-4 flex items-center gap-3">
            <img
              src="/logoyou.png"
              alt="Logo You Smile Fight"
              className="h-10 w-10 object-contain"
            />

            <div>
              <h2 className="font-semibold text-white">YOU SMILE FIGHT</h2>

              <p className="text-xs tracking-wide text-yellow-400">
                SWEAT • SMILE • REPEAT
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed">
            Mais que um treino.
            <br />
            Uma comunidade que te puxa para frente.
            <br />
            Energia, disciplina e evolução.
          </p>
        </div>

        {/* LINHA DIVISÓRIA */}
        <div className="hidden w-px bg-yellow-400/30 md:block" />

        {/* NAVEGAÇÃO */}
        <div className="w-full md:w-44">
          <h3 className="mb-4 font-semibold text-yellow-400">NAVEGAÇÃO</h3>

          <ul className="space-y-3">
            {[
              { label: "TREINOS", href: "#treinos" },
              { label: "PLANOS", href: "#planos" },
              { label: "SOBRE NÓS", href: "#sobre" },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center justify-between transition hover:text-white"
                >
                  {item.label}

                  <span className="text-yellow-400">›</span>
                </a>

                <div className="mt-2 h-px bg-yellow-400/20" />
              </li>
            ))}
          </ul>
        </div>

        {/* LINHA DIVISÓRIA */}
        <div className="hidden w-px bg-yellow-400/30 md:block" />

        {/* CONTATO */}
        <div>
          <h3 className="mb-4 font-semibold text-yellow-400">FALE CONOSCO</h3>

          <div className="space-y-5 text-sm">
            {/* ENDEREÇO */}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Rua+Baluarte+31+Vila+Olímpia+São+Paulo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 transition hover:text-white"
            >
              <img
                src="/location.png"
                alt=""
                className="mt-1 h-4 w-4 object-contain opacity-70"
              />

              <span>
                Rua Baluarte, 31 - Vila Olímpia
                <br />
                São Paulo - SP
              </span>
            </a>

            {/* TELEFONE / WHATSAPP */}
            <a
              href="https://wa.me/5511939478819"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <img
                src="/phone.png"
                alt=""
                className="h-4 w-4 object-contain opacity-70"
              />

              <span>(11) 93947-8819</span>
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/yousmilefight"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 transition hover:text-white"
            >
              <img
                src="/instagram.png"
                alt=""
                className="h-4 w-4 object-contain opacity-70"
              />

              <span>@yousmilefight</span>
            </a>
          </div>
        </div>
      </div>

      {/* LINHA FINAL */}
      <div className="mx-auto mt-10 flex max-w-6xl flex-col justify-between gap-4 border-t border-yellow-400/30 pt-6 text-xs text-gray-500 md:flex-row">
        <p>© 2026 You Smile Fight — Todos os direitos reservados.</p>

        <div className="flex flex-wrap gap-4">
          <a href="#" className="transition hover:text-white">
            Política de Privacidade
          </a>

          <span>•</span>

          <a href="#" className="transition hover:text-white">
            Termos de Uso
          </a>

          <span>•</span>

          <a href="#" className="transition hover:text-white">
            Cookies
          </a>
        </div>
      </div>
    </footer>
  );
}