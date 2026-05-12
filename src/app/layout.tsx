import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConsultaALL | Dados e Informações Essenciais",
  description: "Plataforma avançada para consultas de dados pessoais, veiculares, empresas e processos. Decisões rápidas e assertivas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}
      >
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Toaster richColors theme="dark" position="top-right" />
      </body>
    </html>
  );
}
