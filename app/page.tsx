import Header from "./components/Header";
import Hero from "./components/Hero";
import Plans from "./components/Plans";
import Footer from "./components/Footer";
import Treinos from "./components/Treinos";
import Sobre from "./components/Sobre";

const gymJsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "@id": "https://yousmilefight.com.br/#gym",
  name: "You Smile Fight",
  url: "https://yousmilefight.com.br",
  logo: "https://yousmilefight.com.br/logoyou.png",
  image: "https://yousmilefight.com.br/opengraph-image.png",
  description:
    "Studio de Funcional Fight em São Paulo com treinos de funcional, Boxe e Muay Thai.",
  telephone: "+55 11 93947-8812",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Baluarte, 31",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: "04549-010",
    addressCountry: "BR",
  },
  sameAs: [
    "https://www.instagram.com/yousmilefight/",
  ],
};

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(gymJsonLd),
        }}
      />

      <Header />
      <Hero />
      <Treinos />
      <Plans />
      <Sobre />
      <Footer />
    </main>
  );
}