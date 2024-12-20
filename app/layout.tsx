import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import ModalProvider from "@/components/modal-provider";
import ToasterProvider from "@/components/toaster-provider";
import CrispProvider from "@/components/crisp-provider";

import { ptBR } from '@clerk/localizations'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chefely - Inspirando Sabores",
  description: "Receitas, dicas e truques para você se tornar um chef em casa.",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <CrispProvider />
        <body className={inter.className}>
          <ModalProvider />
          <ToasterProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
