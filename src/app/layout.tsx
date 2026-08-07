import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HeaderAnalistaLogado from "@/components/layout/HeaderAnalistaLogado";
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
  title: "Passagem de Turno — NOC/VOC",
  description: "Sistema de passagem de turno para times de NOC/VOC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900">
        <HeaderAnalistaLogado />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
