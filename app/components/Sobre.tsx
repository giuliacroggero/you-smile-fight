"use client";

import { useState } from "react";

export default function Sobre() {

  const professores = [
    {
      nome: "LUIZ FERNANDO",
      imagem: "/luiz.png",
      texto:
        "Professor de funcional fight desde 2018, Luiz é conhecido pelas aulas intensas, dinâmicas e de alto gasto calórico.",
    },

    {
      nome: "TRINDADE",
      imagem: "/trindade.png",
      texto:
        "Especialista em emagrecimento e treinos dinâmicos, Trindade une intensidade, técnica e adaptação individual.",
    },

    {
      nome: "ADRIEL",
      imagem: "/adriel.png",
      texto:
        "Adriel tem aulas versáteis, dinâmicas e sempre diferentes, criando conexão e fidelidade com suas alunas.",
    },

    {
      nome: "MATHEUS SALES",
      imagem: "/matheus.png",
      texto:
        "Matheus leva intensidade, dinamismo e muita energia para os treinos, sempre com alto astral.",
    },

    {
      nome: "ZENON",
      imagem: "/zenon.png",
      texto:
        "Ex-boxeador e tricampeão estadual, Zenon entrega treinos técnicos, intensos e focados em performance.",
    },

    {
      nome: "MAX",
      imagem: "/max.png",
      texto:
        "Max une técnica, intensidade e perfeccionismo sem perder o astral dentro das aulas.",
    },

    {
      nome: "MASCOTE",
      imagem: "/mascote.png",
      texto:
        "Mascote é conhecido pela energia, humildade e pelas aulas intensas e desafiadoras.",
    },
  ];

  const [current, setCurrent] = useState(0);

  const nextProfessor = () => {
    setCurrent((prev) =>
      prev === professores.length - 1 ? 0 : prev + 1
    );
  };

  const prevProfessor = () => {
    setCurrent((prev) =>
      prev === 0 ? professores.length - 1 : prev - 1
    );
  };

  return (
  <section
    id="sobre"
    className="scroll-mt-24 bg-black text-white px-6 py-14 overflow-hidden"
  >
    <div className="max-w-6xl mx-auto">

      {/* TITULO */}
      <div className="text-center mb-8">
        <p className="text-yellow-400 uppercase tracking-[0.3em] text-xs mb-3">
          Nosso time
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mb-3">
          Professores You Fight
        </h2>

        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          Intensidade, técnica e personalidade dentro e fora do treino.
        </p>
      </div>

      {/* CARD */}
      <div className="relative bg-[#0a0a0a] border border-gray-800 rounded-[32px] p-6 md:p-8">

        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[390px]">

          {/* FOTO */}
          <div className="flex justify-center">
            <img
              src={professores[current].imagem}
              alt={professores[current].nome}
              className="w-[260px] h-[330px] rounded-[28px] object-cover object-top"
            />
          </div>

          {/* TEXTO */}
          <div className="flex flex-col justify-center h-full">
            <p className="text-yellow-400 uppercase tracking-[0.3em] text-xs mb-3">
              Professor
            </p>

            <h3 className="text-3xl md:text-4xl font-bold mb-5">
              {professores[current].nome}
            </h3>

            <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-[500px] min-h-[90px]">
              {professores[current].texto}
            </p>

            {/* CONTROLES */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevProfessor}
                className="w-10 h-10 rounded-full border border-gray-700 hover:border-yellow-400 hover:text-yellow-400 transition"
              >
                ←
              </button>

              <button
                onClick={nextProfessor}
                className="w-10 h-10 rounded-full bg-yellow-400 text-black hover:scale-105 transition"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* BOLINHAS */}
        <div className="flex justify-center gap-3 mt-6">
          {professores.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2.5 h-2.5 rounded-full transition ${
                current === index ? "bg-yellow-400" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);
}