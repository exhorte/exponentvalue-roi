/**
 * Types du moteur de calcul du Calculateur ROI ExponentValue.
 *
 * Ce fichier est la source de vérité sur la FORME des données saisies dans
 * l'assistant en 6 étapes (Contexte, Coûts, Bénéfices, Maturité, Timeline,
 * Résultats). Toute la logique de calcul (engine.ts) part de ces types.
 */

export type Faisabilite = "faible" | "moyenne" | "elevee";
export type Recommandation = "GO" | "EVALUER" | "STOP";

/** Étape 1 — Contexte : coût actuel du problème (avant IA). */
export interface ProblemCostInputs {
  tempsPerdu?: {
    actif: boolean;
    heuresParMois: number;
    coutHoraireCharge: number;
  };
  erreurs?: {
    actif: boolean;
    nombreParMois: number;
    coutMoyenParErreur: number;
  };
  perteClients?: {
    actif: boolean;
    clientsParMois: number;
    valeurMoyenneClient: number;
  };
}

/** Étape 2 — Coûts : investissement initial (CAPEX) et coûts récurrents (OPEX). */
export interface CostInputs {
  capex: {
    coutSolutionIA: number;
    coutIntegration: number;
    coutFormationEquipes: number;
    coutConduiteChangement: number;
  };
  opex: {
    consommationApiLLM: number;
    hebergementCloud: number;
    maintenance: number;
    autresCoutsRecurrents: number;
  };
  /** Taux d'actualisation annuel (WACC), en pourcentage (ex. 10 = 10%). */
  tauxActualisation: number;
}

/**
 * Étape 3 — Bénéfices : une entrée PAR catégorie, chacune avec son PROPRE
 * coefficient de réalisme (contrairement au prototype de référence où un
 * seul coefficient global s'appliquait à toutes les catégories mélangées).
 */
export interface BenefitInputs {
  gainsProductivite?: {
    actif: boolean;
    heuresEconomiseesParMois: number;
    coutHoraireMoyenCharge: number;
    /** Part du temps libéré réellement réaffectée à un travail utile (0-1). */
    coefficientReallocation: number;
    /** Valeur relative des tâches vers lesquelles le temps est réalloué (multiplicateur, ex. 1.5). */
    valeurTempsRealloue: number;
  };
  reductionErreurs?: {
    actif: boolean;
    erreursEviteesParMois: number;
    coutMoyenParErreur: number;
    coefficientRealisme: number;
  };
  retentionClients?: {
    actif: boolean;
    clientsRetenusParMois: number;
    valeurMoyenneClient: number;
    coefficientRealisme: number;
  };
}

/** Étape 4 — Maturité : curseurs de confiance organisationnelle (0 = défavorable, 1 = favorable). */
export interface MaturityInputs {
  fiabiliteDonnees: number;
  simplicitProbleme: number;
  faisabiliteTechnique: Faisabilite;
}

/**
 * Étape 5 — Timeline : la courbe de montée en charge des bénéfices est ici
 * rendue EXPLICITE et modifiable (c'est l'hypothèse qui, dans le prototype
 * de référence, existait dans le calcul sans apparaître nulle part à l'écran).
 */
export interface TimelineInputs {
  dateDebutSouhaitee?: string;
  /** % du bénéfice réaliste effectivement capté en Année 1, 2, 3 (0-1 chacun). */
  courbeMonteeEnCharge: [number, number, number];
}

export interface ProjectInputs {
  nom: string;
  secteur?: string;
  probleme: ProblemCostInputs;
  couts: CostInputs;
  benefices: BenefitInputs;
  maturite: MaturityInputs;
  timeline: TimelineInputs;
}

/** Résultat calculé, mis en cache en base pour un affichage instantané du Dashboard. */
export interface ProjectResults {
  coutProblemeAnnuel: number;
  capexTotal: number;
  opexAnnuelTotal: number;
  beneficeBrutAnnuel: number;
  beneficeRealisteAnnuel: number;
  coefficientRealismeGlobal: number;
  cashFlows: CashFlowYear[];
  roiParAnnee: number[];
  vanCumuleeParAnnee: number[];
  delaiRecuperationMois: number | null;
  score: number;
  recommandation: Recommandation;
  scoreDetail: ScoreBreakdown;
  calculeLe: string;
}

export interface CashFlowYear {
  annee: number; // 0 = investissement, 1..3 = années d'exploitation
  fluxBrut: number;
  fluxActualise: number;
  cumulActualise: number;
}

export interface ScoreBreakdown {
  pointsRoi: number;
  pointsPayback: number;
  pointsConfiance: number;
  pointsFaisabilite: number;
  total: number;
}
