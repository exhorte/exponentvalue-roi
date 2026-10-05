import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, FolderOpen } from "lucide-react";

import { WIZARD_STEPS, getStepNav, type ProjectRow, type WizardStep } from "@/lib/wizard-steps";
import { formatShortDate } from "@/lib/utils";
import { AppShell, HeaderInfo } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectNameEditor } from "@/components/wizard/project-name-editor";
import { StepProgress } from "@/components/wizard/step-progress";
import { StatusPill } from "@/components/recommendation-badge";

/** Coque partagée par les 6 étapes : barre latérale avec les étapes, titre éditable, progression. */
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
  const { index } = getStepNav(activeStep);

  return (
    <AppShell
      project={{ id: project.id, nom: project.nom, etapeCourante: project.etape_courante }}
      activeStep={activeStep}
      headerInfo={
        <HeaderInfo icon={FolderOpen}>
          {project.secteur ?? "Projet sur mesure"} · modifié le {formatShortDate(project.updated_at)}
        </HeaderInfo>
      }
      headerActions={
        <StatusPill
          recommandation={project.recommandation}
          score={project.score}
          className="max-sm:hidden"
        />
      }
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Tableau de bord
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="min-w-0 truncate text-foreground">{project.nom}</span>
          </nav>
          <PageHeader
            title={
              <h1>
                <ProjectNameEditor id={project.id} initialName={project.nom} />
              </h1>
            }
            subtitle={`Étape ${index + 1} sur ${WIZARD_STEPS.length} · ${WIZARD_STEPS[index].label}`}
          />
          <StepProgress projectId={project.id} activeIndex={index} furthestIndex={furthestIndex} />
        </div>

        {children}
      </div>
    </AppShell>
  );
}
