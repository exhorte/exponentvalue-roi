import type { ProjectInputs, ProjectResults, Recommandation } from "@/lib/calc/types";

/**
 * Définition des 6 étapes de l'assistant et de la forme d'une ligne `projects`.
 *
 * Fichier séparé de `lib/actions.ts` exprès : ce dernier porte la directive
 * "use server", qui interdit d'exporter autre chose que des fonctions async
 * (un tableau comme `WIZARD_STEPS` ferait échouer le build avec "A 'use
 * server' file can only export async functions").
 */

export type WizardStep =
  | "contexte"
  | "couts"
  | "benefices"
  | "maturite"
  | "timeline"
  | "resultats";

export const WIZARD_STEPS: { key: WizardStep; label: string }[] = [
  { key: "contexte", label: "Contexte" },
  { key: "couts", label: "Coûts" },
  { key: "benefices", label: "Bénéfices" },
  { key: "maturite", label: "Maturité" },
  { key: "timeline", label: "Timeline" },
  { key: "resultats", label: "Résultats" },
];

export interface ProjectRow {
  id: string;
  nom: string;
  secteur: string | null;
  statut: "brouillon" | "complete";
  etape_courante: WizardStep;
  inputs: ProjectInputs;
  results: ProjectResults | null;
  score: number | null;
  recommandation: Recommandation | null;
  created_at: string;
  updated_at: string;
}

/** Étape précédente / suivante dans l'assistant, à partir de l'étape courante. */
export function getStepNav(step: WizardStep) {
  const index = WIZARD_STEPS.findIndex((s) => s.key === step);
  return {
    index,
    previous: index > 0 ? WIZARD_STEPS[index - 1].key : null,
    next: index >= 0 && index < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[index + 1].key : null,
  };
}
