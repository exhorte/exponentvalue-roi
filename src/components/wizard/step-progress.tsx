import Link from "next/link";
import { WIZARD_STEPS } from "@/lib/wizard-steps";
import { cn } from "@/lib/utils";

/**
 * Progression segmentée : un segment par étape (plein si franchie ou
 * active), libellés cliquables en dessous à partir de la taille tablette.
 */
export function StepProgress({
  projectId,
  activeIndex,
  furthestIndex,
}: {
  projectId: string;
  activeIndex: number;
  furthestIndex: number;
}) {
  return (
    <ol className="grid grid-cols-6 gap-1.5 sm:gap-2" aria-label="Étapes de l'assistant">
      {WIZARD_STEPS.map((step, i) => {
        const isActive = i === activeIndex;
        const isCleared = i < furthestIndex;
        return (
          <li key={step.key}>
            <Link
              href={`/projets/${projectId}/${step.key}`}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Étape ${i + 1} : ${step.label}`}
              className="group flex flex-col gap-2 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  isActive
                    ? "bg-primary"
                    : isCleared
                      ? "bg-primary/35 group-hover:bg-primary/50"
                      : "bg-secondary group-hover:bg-accent"
                )}
              />
              <span
                className={cn(
                  "hidden truncate text-xs sm:block",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {step.label}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
