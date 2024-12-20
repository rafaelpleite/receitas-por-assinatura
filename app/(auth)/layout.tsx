import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chefely - Inspirando Sabores",
  description: "Receitas, dicas e truques para você se tornar um chef em casa.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center h-full">{children}</div>
  );
}
