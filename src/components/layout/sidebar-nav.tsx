"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CircleCheck, LayoutDashboard, LogOut, Plus, type LucideIcon } from "lucide-react";

import { logoutAction } from "@/lib/actions";
import { WIZARD_STEPS, type WizardStep } from "@/lib/wizard-steps";
import { STEP_ICONS } from "@/components/wizard/step-icons";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

export type SidebarProject = { id: string; nom: string; etapeCourante: WizardStep };

const itemClass = (active: boolean) =>
  cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors outline-none",
    "focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-4 [&_svg]:shrink-0",
    active
      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-xs ring-1 ring-sidebar-border"
      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
  );

/**
 * Contenu de la barre latérale, partagé entre la colonne fixe (desktop) et le
 * tiroir mobile. `onNavigate` ferme le tiroir après un clic sur un lien.
 */
export function SidebarNav({
  project,
  activeStep,
  onNavigate,
}: {
  project?: SidebarProject;
  activeStep?: WizardStep;
  onNavigate?: () => void;
}) {
  const furthestIndex = project
    ? WIZARD_STEPS.findIndex((s) => s.key === project.etapeCourante)
    : -1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
        <Link href="/" onClick={onNavigate} className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6" aria-label="Navigation principale">
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink href="/" icon={LayoutDashboard} active={!project} onClick={onNavigate}>
              Tableau de bord
            </NavLink>
          </li>
          <li>
            <NewProjectDialog>
              <button type="button" className={itemClass(false)}>
                <Plus />
                Nouveau projet
              </button>
            </NewProjectDialog>
          </li>
        </ul>

        {project && (
          <div className="mt-8">
            <p className="px-3 text-[11px] font-medium tracking-wider text-sidebar-foreground/70 uppercase">
              Projet en cours
            </p>
            <p className="mt-1.5 truncate px-3 text-sm font-medium text-foreground" title={project.nom}>
              {project.nom}
            </p>
            <ol className="mt-3 flex flex-col gap-1">
              {WIZARD_STEPS.map((step, i) => {
                const isCleared = i < furthestIndex;
                return (
                  <li key={step.key}>
                    <NavLink
                      href={`/projets/${project.id}/${step.key}`}
                      icon={STEP_ICONS[step.key]}
                      active={step.key === activeStep}
                      onClick={onNavigate}
                      trailing={
                        isCleared ? (
                          <CircleCheck className="text-success" aria-label="Étape complétée" />
                        ) : (
                          <span className="text-[11px] text-sidebar-foreground/60 tabular-nums">
                            {i + 1}
                          </span>
                        )
                      }
                    >
                      {step.label}
                    </NavLink>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </nav>

      <div className="flex h-14 shrink-0 items-center border-t border-sidebar-border px-3">
        <form action={logoutAction} className="w-full">
          <button type="submit" className={itemClass(false)}>
            <LogOut />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  active,
  onClick,
  trailing,
  children,
}: {
  href: string;
  icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={itemClass(active)}
    >
      <Icon />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </Link>
  );
}
