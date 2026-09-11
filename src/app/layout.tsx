import type { Metadata } from "next";
import "./globals.css";

// Pas de next/font/google ici volontairement : l'outil tourne dans des
// environnements (build sandbox, réseaux d'entreprise restreints) qui ne
// peuvent pas toujours atteindre fonts.googleapis.com. La pile système
// (définie dans globals.css) évite cette dépendance réseau au build.

export const metadata: Metadata = {
  title: "Calculateur ROI — ExponentValue",
  description:
    "Outil interne ExponentValue : chiffrer un projet IA avant de le construire, et produire un business case défendable.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
