const whatsappNumber = "5511939478819";

type TrainingOption = {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  message: string;
  highlight: boolean;
};

const trainingOptions: TrainingOption[] = [
  {
    title: "Individual",
    subtitle: "Treino personalizado",
    description:
      "Acompanhamento exclusivo, respeitando seu ritmo, objetivo e condicionamento.",
    features: [
      "Treino adaptado ao seu nível",
      "Acompanhamento individual",
      "Foco total na sua evolução",
      "Horários sob consulta",
    ],
    message:
      "Olá! Tenho interesse no treino individual da You Smile Fight. Gostaria de receber mais informações.",
    highlight: false,
  },
  {
    title: "Em dupla",
    subtitle: "Evoluam juntos",
    description:
      "Uma experiência personalizada para quem quer treinar acompanhado.",
    features: [
      "Treino para duas pessoas",
      "Orientação personalizada",
      "Mais motivação e energia",
      "Horários sob consulta",
    ],
    message:
      "Olá! Tenho interesse no treino em dupla da You Smile Fight. Gostaria de receber mais informações.",
    highlight: true,
  },
  {
    title: "Experimental",
    subtitle: "Conheça nosso treino",
    description:
      "Experimente a metodologia You Smile Fight antes de escolher seu formato.",
    features: [
      "Conheça nossa metodologia",
      "Treino adaptado ao seu nível",
      "Converse com o professor",
      "Agendamento pelo WhatsApp",
    ],
    message:
      "Olá! Gostaria de agendar uma aula experimental na You Smile Fight.",
    highlight: false,
  },
  {
    title: "Personalizado",
    subtitle: "Feito para sua rotina",
    description:
      "Nossa equipe ajuda você a encontrar a melhor frequência e formato de treino.",
    features: [
      "Opções conforme seu objetivo",
      "Frequência personalizada",
      "Atendimento direto",
      "Condições sob consulta",
    ],
    message:
      "Olá! Gostaria de encontrar o formato de treino ideal para mim na You Smile Fight.",
    highlight: true,
  },
];

export default function Plans() {
  function getWhatsAppLink(message: string) {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message,
    )}`;
  }

  return (
    <section
      id="planos"
      className="relative scroll-mt-24 overflow-hidden bg-black px-6 py-12 text-white"
    >
      {/* FUNDO DECORATIVO */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-yellow-400 blur-[140px]" />

        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-yellow-400 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* TÍTULO */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-yellow-400">
            You Smile Fight
          </p>

          <h2 className="mb-2 text-4xl font-bold md:text-[46px]">
            ENCONTRE O TREINO IDEAL
          </h2>

          <p className="mx-auto max-w-2xl text-base text-gray-400">
            Escolha o formato que mais combina com sua rotina e fale com nossa
            equipe para conhecer disponibilidade e condições.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trainingOptions.map((option) => (
            <article
              key={option.title}
              className={`relative flex min-h-[390px] flex-col overflow-hidden rounded-[28px] border p-5 transition duration-300 hover:-translate-y-2 ${
                option.highlight
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-gray-800 bg-[#0a0a0a] text-white"
              }`}
            >
              {/* ARCO DECORATIVO */}
              <div
                className={`absolute -top-16 left-1/2 h-[130px] w-[260px] -translate-x-1/2 rounded-b-full border-b ${
                  option.highlight
                    ? "border-white/25"
                    : "border-white/15"
                }`}
              />

              <div className="relative z-10">
                <h3 className="mb-1 text-2xl font-bold">{option.title}</h3>

                <p className="mb-5 text-sm opacity-70">{option.subtitle}</p>

                <div
                  className={`mb-5 h-px w-full ${
                    option.highlight ? "bg-black/30" : "bg-gray-700"
                  }`}
                />

                <p
                  className={`mb-6 min-h-[60px] text-sm leading-relaxed ${
                    option.highlight ? "text-black/75" : "text-gray-400"
                  }`}
                >
                  {option.description}
                </p>
              </div>

              {/* BENEFÍCIOS */}
              <div className="relative z-10 flex-1 space-y-4">
                {option.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <span
                      className={`font-bold ${
                        option.highlight
                          ? "text-black"
                          : "text-yellow-400"
                      }`}
                    >
                      ✓
                    </span>

                    <span className="text-sm font-semibold">{feature}</span>
                  </div>
                ))}
              </div>

              {/* BOTÃO */}
              <a
                href={getWhatsAppLink(option.message)}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative z-10 mt-8 block rounded-2xl py-3 text-center text-base font-semibold transition ${
                  option.highlight
                    ? "bg-black text-yellow-400 hover:opacity-80"
                    : "bg-yellow-400 text-black hover:scale-105"
                }`}
              >
                Falar com a equipe
              </a>
            </article>
          ))}
        </div>

        {/* INFORMAÇÃO FINAL */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Valores, disponibilidade e condições são informados diretamente pela
          nossa equipe.
        </p>
      </div>
    </section>
  );
}