export default function Treinos() {
  return (
    <section
      id="treinos"
      className="scroll-mt-24 bg-black text-white px-6 md:px-20 py-20 md:py-24"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        
        {/* TEXTO */}
        <div>
          <p className="text-yellow-400 uppercase tracking-[0.3em] text-sm mb-4">
            Método You Fight
          </p>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Muito mais
            <br />
            que um treino.
          </h2>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            Aulas de 50 minutos que unem funcional, técnicas de
            Muay Thai e Boxe em uma experiência intensa,
            dinâmica e personalizada.
          </p>

          {/* tópicos */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>Funcional + luta</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>Alta intensidade</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>Atendimento personal</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>Turmas reduzidas</span>
            </div>
          </div>

          <button className="bg-yellow-400 text-black font-semibold px-8 py-4 rounded-xl hover:scale-105 transition">
            AGENDAR AULA
          </button>
        </div>

        {/* IMAGEM */}
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400/10 blur-3xl rounded-full" />

          <img
            src="/hero2.png"
            alt="Treino funcional"
            className="relative rounded-3xl object-cover w-full h-[420px] md:h-[500px]"
          />
        </div>
      </div>
    </section>
  );
}