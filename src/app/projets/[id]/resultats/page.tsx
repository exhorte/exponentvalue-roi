import { notFound } from "next/navigation";
import { getProject, saveProjectStep } from "@/lib/actions";
import type { ProjectRow } from "@/lib/wizard-steps";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { ResultatsView } from "./resultats-view";

export const dynamic = "force-dynamic";

export default async function ResultatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  // Les résultats sont déjà recalculés à chaque étape précédente (voir
  // saveProjectStep) — ici, on finalise juste le statut si ce n'est pas déjà
  // fait (ex. accès direct via le stepper). On construit la vue à jour à la
  // main plutôt que de rappeler getProject(id), qui est mémoïsé (React
  // cache()) pour la durée de la requête et renverrait la version d'AVANT
  // cette écriture.
  let view: ProjectRow = project;
  if (project.statut !== "complete") {
    const { results } = await saveProjectStep(id, {}, "resultats");
    view = {
      ...project,
      results,
      score: results.score,
      recommandation: results.recommandation,
      statut: "complete",
      etape_courante: "resultats",
    };
  }

  if (!view.results) notFound();

  return (
    <WizardShell project={view} activeStep="resultats">
      <ResultatsView project={view} />
    </WizardShell>
  );
}
