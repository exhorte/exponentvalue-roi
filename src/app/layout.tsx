import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";

// Pas de next/font/google ici volontairement : l'outil tourne dans des
// environnements (build sandbox, réseaux d'entreprise restreints) qui ne
// peuvent pas toujours atteindre fonts.googleapis.com. Inter est donc
// embarquée via le paquet npm @fontsource-variable/inter (fichiers servis par
// l'app elle-même, aucune requête réseau au build ni au runtime).

export const metadata: Metadata = {
  title: "Calculateur ROI — ExponentValue",
  description:
    "Outil interne ExponentValue : chiffrer un projet IA avant de le construire, et produire un business case défendable.",
};

// Applique le thème mémorisé (clair/sombre) AVANT le premier rendu, pour
// éviter un flash du thème clair (voir le guide Next "Preventing Flash").
const THEME_SCRIPT = `(function(){try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
