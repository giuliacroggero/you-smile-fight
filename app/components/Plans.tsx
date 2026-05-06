export default function Plans() {
  return (
    <section className="bg-black text-white py-20 px-6">

      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-4xl font-bold mb-4">
          Nossos Planos
        </h2>

        <p className="text-gray-400 mb-12">
          Escolha o plano ideal para você evoluir
        </p>

        <div className="grid md:grid-cols-3 gap-8">

          {/* CARD */}
          <div className="border border-gray-800 p-6 rounded-xl hover:border-yellow-400 transition">
            <h3 className="text-xl font-semibold mb-2">Básico</h3>
            <p className="text-3xl font-bold mb-4">R$ 199</p>

            <ul className="text-gray-400 space-y-2 mb-6">
              <li>✔ 2x por semana</li>
              <li>✔ Acesso às aulas</li>
              <li>✔ Suporte básico</li>
            </ul>

            <button className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:scale-105 transition">
              Escolher Plano
            </button>
          </div>

          {/* CARD DESTACADO */}
          <div className="border border-yellow-400 p-6 rounded-xl bg-yellow-400/10 scale-105">
            <h3 className="text-xl font-semibold mb-2">Premium</h3>
            <p className="text-3xl font-bold mb-4">R$ 299</p>

            <ul className="text-gray-300 space-y-2 mb-6">
              <li>✔ Treinos ilimitados</li>
              <li>✔ Acompanhamento</li>
              <li>✔ Prioridade reservas</li>
            </ul>

            <button className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:scale-105 transition">
              Mais Popular
            </button>
          </div>

          {/* CARD */}
          <div className="border border-gray-800 p-6 rounded-xl hover:border-yellow-400 transition">
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="text-3xl font-bold mb-4">R$ 399</p>

            <ul className="text-gray-400 space-y-2 mb-6">
              <li>✔ Personal trainer</li>
              <li>✔ Plano individual</li>
              <li>✔ Suporte completo</li>
            </ul>

            <button className="w-full bg-yellow-400 text-black py-2 rounded-lg font-semibold hover:scale-105 transition">
              Escolher Plano
            </button>
          </div>

        </div>

        <div className="mt-12 flex justify-center">
            <a
              href="/planos"
              className="inline-flex items-center gap-2 border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
            >
              Ver todos os planos
              <span>→</span>
            </a>
        </div>

      </div>

    </section>
  );
}