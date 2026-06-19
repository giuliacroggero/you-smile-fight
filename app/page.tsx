import Header from "./components/Header";
import Hero from "./components/Hero";
import Plans from "./components/Plans";
import Footer from "./components/Footer";
import Treinos from "./components/Treinos";
import Sobre from "./components/Sobre";

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Header />
      <Hero />
      <Treinos />
      <Plans />
      <Sobre />
      <Footer />
    </main>
  );
}