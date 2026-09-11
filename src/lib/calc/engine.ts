/**
 * Moteur de calcul du Calculateur ROI ExponentValue.
 *
 * Principe directeur (voir `Calculateur ROI - Analyse et Strategie.md`) :
 * CHAQUE nombre affiché à l'écran doit pouvoir être retracé jusqu'à sa
 * formule. Aucun coefficient global "boîte noire" — chaque multiplicateur
 * est documenté ci-dessous et son détail est renvoyé à l'appelant pour
 * affichage (voir `ScoreBreakdown`, `coefficientRealismeGlobal`, etc.).
 *
 * Méthodologie : inspirée du framework Forrester Total Economic Impact
 * (Coûts / Bénéfices / Risque) et d'une estimation de type PERT pour
 * l'ajustement au risque (un coefficient de réalisme par catégorie plutôt
 * qu'un multiplicateur unique appliqué à l'ensemble).
 */

import type {
  BenefitInputs,
  CashFlowYear,
  CostInputs,
  Faisabilite,
  MaturityInputs,
  ProblemCostInputs,
  ProjectInputs,
  ProjectResults,
  Recommandation,
  ScoreBreakdown,
} from "./types";
import { SCORE_THRESHOLDS } from "./defaults";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const n = (v: number | undefined | null) => (Number.isFinite(v) ? (v as number) : 0);

/* ------------------------------------------------------------------ */
/* Étape 1 — Coût annuel du problème actuel                            */
/* ------------------------------------------------------------------ */

export interface ProblemCostLine {
  key: string;
  label: string;
  annuel: number;
}

export function computeProblemCost(inputs: ProblemCostInputs) {
  const lines: ProblemCostLine[] = [];

  if (inputs.tempsPerdu?.actif) {
    lines.push({
      key: "tempsPerdu",
      label: "Temps perdu",
      annuel: n(inputs.tempsPerdu.heuresParMois) * n(inputs.tempsPerdu.coutHoraireCharge) * 12,
    });
  }
  if (inputs.erreurs?.actif) {
    lines.push({
      key: "erreurs",
      label: "Erreurs & corrections",
      annuel: n(inputs.erreurs.nombreParMois) * n(inputs.erreurs.coutMoyenParErreur) * 12,
    });
  }
  if (inputs.perteClients?.actif) {
    lines.push({
      key: "perteClients",
      label: "Perte de clients",
      annuel: n(inputs.perteClients.clientsParMois) * n(inputs.perteClients.valeurMoyenneClient) * 12,
    });
  }

  const total = lines.reduce((s, l) => s + l.annuel, 0);
  return { lines, total };
}

/* ------------------------------------------------------------------ */
/* Étape 2 — Investissement (CAPEX) et coûts récurrents (OPEX)         */
/* ------------------------------------------------------------------ */

export function computeInvestment(inputs: CostInputs) {
  const capexTotal =
    n(inputs.capex.coutSolutionIA) +
    n(inputs.capex.coutIntegration) +
    n(inputs.capex.coutFormationEquipes) +
    n(inputs.capex.coutConduiteChangement);

  const opexAnnuelTotal =
    n(inputs.opex.consommationApiLLM) +
    n(inputs.opex.hebergementCloud) +
    n(inputs.opex.maintenance) +
    n(inputs.opex.autresCoutsRecurrents);

  return { capexTotal, opexAnnuelTotal };
}

/* ------------------------------------------------------------------ */
/* Étape 3 — Bénéfices bruts et réalistes, PAR CATÉGORIE                */
/* ------------------------------------------------------------------ */

export interface BenefitCategoryResult {
  key: string;
  label: string;
  brut: number;
  realiste: number;
  /** Coefficient effectif appliqué à cette catégorie (brut -> réaliste). Toujours affiché, jamais implicite. */
  coefficientEffectif: number;
}

export function computeBenefits(inputs: BenefitInputs) {
  const categories: BenefitCategoryResult[] = [];

  if (inputs.gainsProductivite?.actif) {
    const g = inputs.gainsProductivite;
    const brut = n(g.heuresEconomiseesParMois) * n(g.coutHoraireMoyenCharge) * 12;
    const coefficientEffectif = n(g.coefficientReallocation) * n(g.valeurTempsRealloue);
    categories.push({
      key: "gainsProductivite",
      label: "Gains de productivité (temps)",
      brut,
      realiste: brut * coefficientEffectif,
      coefficientEffectif,
    });
  }

  if (inputs.reductionErreurs?.actif) {
    const e = inputs.reductionErreurs;
    const brut = n(e.erreursEviteesParMois) * n(e.coutMoyenParErreur) * 12;
    categories.push({
      key: "reductionErreurs",
      label: "Réduction des erreurs",
      brut,
      realiste: brut * n(e.coefficientRealisme),
      coefficientEffectif: n(e.coefficientRealisme),
    });
  }

  if (inputs.retentionClients?.actif) {
    const c = inputs.retentionClients;
    const brut = n(c.clientsRetenusParMois) * n(c.valeurMoyenneClient) * 12;
    categories.push({
      key: "retentionClients",
      label: "Rétention de clients",
      brut,
      realiste: brut * n(c.coefficientRealisme),
      coefficientEffectif: n(c.coefficientRealisme),
    });
  }

  const totalBrut = categories.reduce((s, c) => s + c.brut, 0);
  const totalRealiste = categories.reduce((s, c) => s + c.realiste, 0);

  return { categories, totalBrut, totalRealiste };
}

/* ------------------------------------------------------------------ */
/* Étape 4 — Coefficient global de maturité (documenté, pas une boîte  */
/* noire : pondération fixe et visible, appliquée en plus des          */
/* coefficients de réalisme déjà appliqués par catégorie à l'étape 3). */
/* ------------------------------------------------------------------ */

const FAISABILITE_FACTOR: Record<Faisabilite, number> = {
  faible: 0.5,
  moyenne: 0.8,
  elevee: 1.0,
};

/** Pondérations du coefficient global de maturité — volontairement exportées pour être affichées à l'écran. */
export const MATURITY_WEIGHTS = {
  fiabiliteDonnees: 0.4,
  simplicitProbleme: 0.35,
  faisabiliteTechnique: 0.25,
};

export function computeMaturityMultiplier(maturity: MaturityInputs) {
  const fiabilite = clamp(n(maturity.fiabiliteDonnees), 0, 1);
  const simplicite = clamp(n(maturity.simplicitProbleme), 0, 1);
  const faisabilite = FAISABILITE_FACTOR[maturity.faisabiliteTechnique] ?? 0.8;

  const multiplier =
    fiabilite * MATURITY_WEIGHTS.fiabiliteDonnees +
    simplicite * MATURITY_WEIGHTS.simplicitProbleme +
    faisabilite * MATURITY_WEIGHTS.faisabiliteTechnique;

  return { multiplier: clamp(multiplier, 0, 1), fiabilite, simplicite, faisabilite };
}

/* ------------------------------------------------------------------ */
/* Étape 5/6 — Flux de trésorerie, VAN, ROI, délai de récupération      */
/* ------------------------------------------------------------------ */

export function computeCashFlows(params: {
  capexTotal: number;
  opexAnnuelTotal: number;
  beneficeRealisteAnnuelFinal: number;
  courbeMonteeEnCharge: [number, number, number];
  tauxActualisation: number; // %
}): CashFlowYear[] {
  const { capexTotal, opexAnnuelTotal, beneficeRealisteAnnuelFinal, courbeMonteeEnCharge, tauxActualisation } =
    params;
  const wacc = n(tauxActualisation) / 100;

  const years: CashFlowYear[] = [
    { annee: 0, fluxBrut: -capexTotal, fluxActualise: -capexTotal, cumulActualise: -capexTotal },
  ];

  let cumul = -capexTotal;
  for (let i = 1; i <= 3; i++) {
    const rampUp = courbeMonteeEnCharge[i - 1] ?? 1;
    const fluxBrut = beneficeRealisteAnnuelFinal * rampUp - opexAnnuelTotal;
    const fluxActualise = fluxBrut / Math.pow(1 + wacc, i);
    cumul += fluxActualise;
    years.push({ annee: i, fluxBrut, fluxActualise, cumulActualise: cumul });
  }

  return years;
}

/** ROI cumulé actualisé par année = (gains actualisés cumulés - investissement) / investissement. */
export function computeRoiParAnnee(cashFlows: CashFlowYear[], capexTotal: number): number[] {
  if (capexTotal <= 0) return cashFlows.filter((c) => c.annee > 0).map(() => 0);
  return cashFlows
    .filter((c) => c.annee > 0)
    .map((c) => ((c.cumulActualise + capexTotal) / capexTotal) * 100);
}

/**
 * Délai de récupération (payback), en mois, par interpolation linéaire entre
 * la dernière année où le cumul actualisé est négatif et la première où il
 * devient positif. Retourne `null` si le seuil de rentabilité n'est pas
 * atteint sur l'horizon de 3 ans (à afficher comme "non atteint").
 */
export function computePaybackMonths(cashFlows: CashFlowYear[]): number | null {
  for (let i = 1; i < cashFlows.length; i++) {
    const prev = cashFlows[i - 1];
    const curr = cashFlows[i];
    if (prev.cumulActualise < 0 && curr.cumulActualise >= 0) {
      const fractionOfYear = -prev.cumulActualise / (curr.cumulActualise - prev.cumulActualise);
      return (prev.annee + fractionOfYear) * 12;
    }
  }
  return cashFlows[cashFlows.length - 1]?.cumulActualise >= 0
    ? 0
    : null;
}

/* ------------------------------------------------------------------ */
/* Score ARIA — rubrique pondérée et documentée (/20)                  */
/* ------------------------------------------------------------------ */

export function computeAriaScore(params: {
  roiAn3Pct: number;
  paybackMonths: number | null;
  maturityMultiplier: number;
  faisabiliteTechnique: Faisabilite;
}): ScoreBreakdown {
  const { roiAn3Pct, paybackMonths, maturityMultiplier, faisabiliteTechnique } = params;

  // 8 pts : ROI à 3 ans. 0% -> 0 pt, 200%+ -> 8 pts (échelle linéaire entre les deux).
  const pointsRoi = clamp(roiAn3Pct / 200, 0, 1) * 8;

  // 6 pts : vitesse de retour. ≤12 mois -> 6 pts, ≥36 mois (ou jamais atteint) -> 0 pt.
  const paybackForScore = paybackMonths ?? 36;
  const pointsPayback = clamp((36 - paybackForScore) / (36 - 12), 0, 1) * 6;

  // 4 pts : confiance dans les chiffres (coefficient global de maturité, 0-1).
  const pointsConfiance = clamp(maturityMultiplier, 0, 1) * 4;

  // 2 pts : faisabilité technique déclarée.
  const pointsFaisabilite = { faible: 0, moyenne: 1, elevee: 2 }[faisabiliteTechnique] ?? 1;

  const total = Math.round((pointsRoi + pointsPayback + pointsConfiance + pointsFaisabilite) * 10) / 10;

  return {
    pointsRoi: Math.round(pointsRoi * 10) / 10,
    pointsPayback: Math.round(pointsPayback * 10) / 10,
    pointsConfiance: Math.round(pointsConfiance * 10) / 10,
    pointsFaisabilite,
    total: clamp(total, 0, 20),
  };
}

export function scoreToRecommandation(score: number): Recommandation {
  if (score >= SCORE_THRESHOLDS.go) return "GO";
  if (score >= SCORE_THRESHOLDS.evaluer) return "EVALUER";
  return "STOP";
}

/* ------------------------------------------------------------------ */
/* Fonction d'orchestration : calcule TOUT à partir des saisies brutes  */
/* ------------------------------------------------------------------ */

export function computeProjectResults(inputs: ProjectInputs): ProjectResults {
  const probleme = computeProblemCost(inputs.probleme);
  const investissement = computeInvestment(inputs.couts);
  const benefices = computeBenefits(inputs.benefices);
  const maturite = computeMaturityMultiplier(inputs.maturite);

  const beneficeRealisteAnnuelFinal = benefices.totalRealiste * maturite.multiplier;

  const cashFlows = computeCashFlows({
    capexTotal: investissement.capexTotal,
    opexAnnuelTotal: investissement.opexAnnuelTotal,
    beneficeRealisteAnnuelFinal,
    courbeMonteeEnCharge: inputs.timeline.courbeMonteeEnCharge,
    tauxActualisation: inputs.couts.tauxActualisation,
  });

  const roiParAnnee = computeRoiParAnnee(cashFlows, investissement.capexTotal);
  const vanCumuleeParAnnee = cashFlows.filter((c) => c.annee > 0).map((c) => c.cumulActualise);
  const delaiRecuperationMois = computePaybackMonths(cashFlows);

  const scoreDetail = computeAriaScore({
    roiAn3Pct: roiParAnnee[roiParAnnee.length - 1] ?? 0,
    paybackMonths: delaiRecuperationMois,
    maturityMultiplier: maturite.multiplier,
    faisabiliteTechnique: inputs.maturite.faisabiliteTechnique,
  });

  return {
    coutProblemeAnnuel: probleme.total,
    capexTotal: investissement.capexTotal,
    opexAnnuelTotal: investissement.opexAnnuelTotal,
    beneficeBrutAnnuel: benefices.totalBrut,
    beneficeRealisteAnnuel: beneficeRealisteAnnuelFinal,
    coefficientRealismeGlobal: maturite.multiplier,
    cashFlows,
    roiParAnnee,
    vanCumuleeParAnnee,
    delaiRecuperationMois,
    score: scoreDetail.total,
    recommandation: scoreToRecommandation(scoreDetail.total),
    scoreDetail,
    calculeLe: new Date().toISOString(),
  };
}
