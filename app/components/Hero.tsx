"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const images = ["/hero1.png", "/hero2.png", "/hero3.png"];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[80vh] overflow-hidden">

      {/* CARROSSEL */}
      <div className="absolute w-full h-full">
        {images.map((img, index) => (
            <img
            key={index}
            src={img}
            className={`absolute w-full h-full object-cover transition-all duration-1000 ${
            index === current
            ? "opacity-100 scale-100"
            : "opacity-0 scale-105"
        }`}
        />
        ))}
      </div>

      {/* OVERLAY ESCURO */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>

      {/* TEXTO */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          YOU SMILE FIGHT
        </h1>

        <p className="text-lg mb-6 text-gray-200 tracking-wide">
          Sweat. Smile. Repeat.
        </p>

        <div className="flex gap-4">
          <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition">
            AGENDAR AULA
          </button>

          <button className="border border-yellow-400 px-6 py-3 rounded-lg hover:bg-yellow-400 hover:text-black hover:scale-105 transition">
            SAIBA MAIS
          </button>
        </div>

      </div>
    </section>
  );
}