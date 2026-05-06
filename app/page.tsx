import Header from "./components/Header";
import Hero from "./components/Hero";
import Plans from "./components/Plans";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="bg-black text-white min-h-screen">
      <Header />
      <Hero />
      <Plans />
      <Footer />
    </main>
  );
}