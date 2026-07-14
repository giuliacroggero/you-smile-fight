import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yousmilefight.com.br"),

  title: {
    default: "You Smile Fight | Funcional Fight em São Paulo",
    template: "%s | You Smile Fight",
  },

  description:
    "Studio boutique na Vila Olímpia com treinos de Funcional Fight, Boxe e Muay Thai. Conheça nossos planos e agende sua aula.",

  keywords: [
    "You Smile Fight",
    "Funcional Fight",
    "Boxe em São Paulo",
    "Muay Thai em São Paulo",
    "academia Vila Olímpia",
    "treino funcional Vila Olímpia",
  ],

  verification: {
    google: "Ixn_QagTNpcND-UfHJhcM20h15bbokm5fzMP63uIVK8",
  },

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "You Smile Fight | Funcional Fight em São Paulo",
    description:
      "Treinos que combinam funcional, Boxe e Muay Thai na Vila Olímpia.",
    url: "https://yousmilefight.com.br",
    siteName: "You Smile Fight",
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "You Smile Fight | Funcional Fight em São Paulo",
    description:
      "Treinos que combinam funcional, Boxe e Muay Thai na Vila Olímpia.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}