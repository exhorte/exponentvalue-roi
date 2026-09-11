import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

import { WIZARD_STEPS, type ProjectRow, type WizardStep } from "@/lib/wizard-steps";
import { ProjectNameEditor } from "@/components/wizard/project-name-editor";
import { RecommendationBadge } from "@/components/recommendation-badge";
import { cn } from "@/lib/utils";

/** Bandeau + stepper partagés par les 6 étapes de l'assistant. */
export function WizardShell({
  project,
  activeStep,
  children,
}: {
  project: ProjectRow;
  activeStep: WizardStep;
  children: ReactNode;
}) {
  const furthestIndex = WIZARD_STEPS.findIndex((s) => s.key === project.etape_courante);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Retour au dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <ProjectNameEditor id={project.id} initialName={project.nom} />
            {project.secteur && <p className="ml-1 text-xs text-muted-foreground">{project.secteur}</p>}
          </div>
        </div>
        <RecommendationBadge value={project.recommandation} />
      </div>

      <ol className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-muted/30 p-2 sm:gap-2">
        {WIZARD_STEPS.map((step, i) => {
          const isActive = step.key === activeStep;
          const isCleared = i < furthestIndex;
          return (
            <li key={step.key} className="min-w-[6.5rem] flex-1">
              <Link
                href={`/projets/${project.id}/${step.key}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : isCleared
                        ? "bg-success text-success-foreground"
                        : "border border-input bg-background"
                  )}
                >
                  {isCleared ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {children}
    </main>
  );
}
