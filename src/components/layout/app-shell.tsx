import type { ReactNode } from "react";
import Link from "next/link";
import { Check, type LucideIcon } from "lucide-react";

import type { WizardStep } from "@/lib/wizard-steps";
import { SidebarNav, type SidebarProject } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoMark } from "@/components/layout/logo";

/**
 * Coque de l'application : barre latérale fixe (desktop), barre supérieure
 * (info à gauche, actions + thème à droite, hamburger sur mobile), contenu
 * centré et pied de page.
 */
export function AppShell({
  project,
  activeStep,
  headerInfo,
  headerActions,
  children,
}: {
  project?: SidebarProject;
  activeStep?: WizardStep;
  headerInfo?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarNav project={project} activeStep={activeStep} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3">
            <Link href="/" className="rounded-full lg:hidden" aria-label="Tableau de bord">
              <LogoMark />
            </Link>
            <div className="hidden min-w-0 flex-1 items-center lg:flex">{headerInfo}</div>
            <div className="ml-auto flex items-center gap-2">
              {headerActions}
              <ThemeToggle />
              <MobileNav project={project} activeStep={activeStep} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}

/** Petite ligne d'information en haut à gauche de la barre supérieure. */
export function HeaderInfo({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t px-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ExponentValue | Tous droits réservés</p>
        <ul className="flex items-center gap-5">
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-foreground" /> Formules traçables
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-foreground" /> Données hébergées en UE
          </li>
        </ul>
      </div>
    </footer>
  );
}
