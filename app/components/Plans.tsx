"use client";

import { useState } from "react";

export default function Plans() {

  const [planType, setPlanType] = useState("individual");

  const individualPlans = [
  {
    title: "Mensal",
    discount: "-18% avulso",
    duration: "1 mês",
    classes: [
      "4 aulas - R$180/aula",
      "8 aulas - R$165/aula",
      "12 aulas - R$155/aula",
      "20 aulas - R$150/aula",
    ],
    highlight: false,
  },

  {
    title: "Trimestral",
    discount: "-5% de desconto",
    duration: "3 meses",
    classes: [
      "4 aulas - R$171/aula",
      "8 aulas - R$156,75/aula",
      "12 aulas - R$147,25/aula",
      "20 aulas - R$142,50/aula",
    ],
    highlight: true,
  },

  {
    title: "Semestral",
    discount: "-10% de desconto",
    duration: "6 meses",
    classes: [
      "4 aulas - R$162/aula",
      "8 aulas - R$148,50/aula",
      "12 aulas - R$139,50/aula",
      "20 aulas - R$135/aula",
    ],
    highlight: false,
  },

  {
    title: "Anual",
    discount: "-15% de desconto",
    duration: "1 ano",
    classes: [
      "4 aulas - R$144/aula",
      "8 aulas - R$132/aula",
      "12 aulas - R$124/aula",
      "20 aulas - R$120/aula",
    ],
    highlight: true,
  },
  ];

  const duplaPlans = [
  {
    title: "Mensal",
    discount: "-18% avulso",
    duration: "1 mês",
    classes: [
      "4 aulas - R$250/aula",
      "8 aulas - R$240/aula",
      "12 aulas - R$230/aula",
      "20 aulas - R$190/aula",
    ],
    highlight: false,
  },

  {
    title: "Trimestral",
    discount: "-5% de desconto",
    duration: "3 meses",
    classes: [
      "4 aulas - R$237,50/aula",
      "8 aulas - R$228/aula",
      "12 aulas - R$218,50/aula",
      "20 aulas - R$180,50/aula",
    ],
    highlight: true,
  },

  {
    title: "Semestral",
    discount: "-10% de desconto",
    duration: "6 meses",
    classes: [
      "4 aulas - R$225/aula",
      "8 aulas - R$216/aula",
      "12 aulas - R$207/aula",
      "20 aulas - R$171/aula",
    ],
    highlight: false,
  },

  {
    title: "Anual",
    discount: "-15% de desconto",
    duration: "1 ano",
    classes: [
      "4 aulas - R$200/aula",
      "8 aulas - R$192/aula",
      "12 aulas - R$184/aula",
      "20 aulas - R$160/aula",
    ],
    highlight: true,
  },
];

  const currentPlans =
  planType === "individual"
    ? individualPlans
    : duplaPlans;

 return (
  <section
    id="planos"
    className="scroll-mt-24 bg-black relative overflow-hidden text-white py-12 px-6"
  >
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-400 blur-[140px] rounded-full"></div>
    </div>

    <div className="max-w-7xl mx-auto relative z-10">
      {/* TÍTULO */}
      <div className="text-center mb-10">
        <p className="text-yellow-400 uppercase tracking-[0.3em] text-sm mb-3">
          You Smile Fight
        </p>

        <h2 className="text-4xl md:text-[46px] font-bold mb-2">
          PLANOS {planType === "individual" ? "INDIVIDUAIS" : "EM DUPLA"}
        </h2>

        <p className="text-gray-400 text-base">
          Escolha o plano ideal para sua evolução
        </p>
      </div>

      {/* BOTÕES */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setPlanType("individual")}
          className={`px-6 py-2.5 rounded-full border transition ${
            planType === "individual"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "border-gray-700 text-white hover:border-yellow-400"
          }`}
        >
          Individuais
        </button>

        <button
          onClick={() => setPlanType("dupla")}
          className={`px-6 py-2.5 rounded-full border transition ${
            planType === "dupla"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "border-gray-700 text-white hover:border-yellow-400"
          }`}
        >
          Em dupla
        </button>
      </div>

      {/* CARDS */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
        {currentPlans.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-[28px] p-5 border transition hover:-translate-y-2 duration-300 min-h-[360px] flex flex-col overflow-hidden ${
              plan.highlight
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-[#0a0a0a] border-gray-800 text-white"
            }`}
          >
            {/* ARCO DECORATIVO */}
            <div
              className={`absolute -top-16 left-1/2 -translate-x-1/2 w-[260px] h-[130px] rounded-b-full border-b ${
                plan.highlight ? "border-white/25" : "border-white/15"
              }`}
            />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-1">
                {plan.title}
              </h3>

              <p className="text-sm opacity-70 mb-5">
                {plan.discount}
              </p>

              <div
                className={`w-full h-[1px] mb-5 ${
                  plan.highlight ? "bg-black/30" : "bg-gray-700"
                }`}
              />

              <p className="text-lg font-semibold mb-6">
                {plan.duration}
              </p>
            </div>

            <div className="space-y-4 flex-1 relative z-10">
              {plan.classes.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={`text-base font-bold ${
                      plan.highlight ? "text-black" : "text-yellow-400"
                    }`}
                  >
                    ✓
                  </span>

                  <span className="text-sm font-semibold">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <button
              className={`mt-8 py-3 rounded-2xl font-semibold text-base transition relative z-10 ${
                plan.highlight
                  ? "bg-black text-yellow-400 hover:opacity-80"
                  : "bg-yellow-400 text-black hover:scale-105"
              }`}
            >
              Escolher plano
            </button>
          </div>
        ))}
      </div>

      {/* OBSERVAÇÕES */}
      <div className="mt-8 space-y-3 text-sm text-gray-300 max-w-5xl mx-auto">
        <p>
          <span className="text-yellow-400 font-bold">✓</span>{" "}
          Cancelamentos ou remarcações devem ser informados com no mínimo 4h de antecedência.
        </p>

        <p>
          <span className="text-yellow-400 font-bold">✓</span>{" "}
          Em casos de viagem, imprevistos ou necessidade de pausa, o plano poderá ser congelado mediante aviso prévio.
        </p>
      </div>
    </div>
  </section>
  );
}