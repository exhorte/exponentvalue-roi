import type { ProjectInputs } from "./types";

/**
 * Courbe de montée en charge par défaut : 40% du bénéfice réaliste capté en
 * Année 1, 80% en Année 2, 100% en Année 3. Une IA délivre rarement 100% de
 * sa valeur dès le premier mois (délai d'adoption, ajustements) — ce
 * paramètre est volontairement visible et modifiable à l'étape Timeline,
 * plutôt qu'enfoui dans le calcul.
 */
export const DEFAULT_RAMP_UP: [number, number, number] = [0.4, 0.8, 1.0];

export const DEFAULT_WACC = 10;

/** Seuils de score ARIA (voir engine.ts::computeAriaScore pour le détail du calcul). */
export const SCORE_THRESHOLDS = {
  go: 15,
  evaluer: 8,
};

export const FAISABILITE_LABELS: Record<string, string> = {
  faible: "Faible",
  moyenne: "Moyenne",
  elevee: "Élevée",
};

/**
 * Préréglages sectoriels : valeurs de départ plausibles pour aller plus vite,
 * alignées sur les verticales de lancement citées dans `Vision ExponentValue.md`.
 * L'utilisateur les ajuste ensuite — ce sont des points de départ, pas des
 * vérités absolues.
 */
export type SectorPresetKey =
  | "inventory_cash"
  | "document_ops"
  | "customer_ops";

export const SECTOR_PRESETS: Record<
  SectorPresetKey,
  { label: string; description: string; values: Partial<ProjectInputs> }
> = {
  inventory_cash: {
    label: "Inventory & Cash Control",
    description:
      "Stock unifié, prévision des ruptures, suivi des créances, rapprochement ventes-paiements.",
    values: {
      probleme: {
        tempsPerdu: { actif: true, heuresParMois: 80, coutHoraireCharge: 12 },
        erreurs: { actif: true, nombreParMois: 15, coutMoyenParErreur: 150 },
        perteClients: { actif: false, clientsParMois: 0, valeurMoyenneClient: 0 },
      },
      benefices: {
        gainsProductivite: {
          actif: true,
          heuresEconomiseesParMois: 60,
          coutHoraireMoyenCharge: 12,
          coefficientReallocation: 0.6,
          valeurTempsRealloue: 1.2,
        },
        reductionErreurs: {
          actif: true,
          erreursEviteesParMois: 10,
          coutMoyenParErreur: 150,
          coefficientRealisme: 0.5,
        },
      },
    },
  },
  document_ops: {
    label: "DocumentOps",
    description: "Devis, factures, rapports — résultat visible immédiatement.",
    values: {
      probleme: {
        tempsPerdu: { actif: true, heuresParMois: 100, coutHoraireCharge: 15 },
        erreurs: { actif: true, nombreParMois: 20, coutMoyenParErreur: 80 },
      },
      benefices: {
        gainsProductivite: {
          actif: true,
          heuresEconomiseesParMois: 80,
          coutHoraireMoyenCharge: 15,
          coefficientReallocation: 0.65,
          valeurTempsRealloue: 1.3,
        },
      },
    },
  },
  customer_ops: {
    label: "Customer / ServiceOps",
    description: "WhatsApp, e-mail, qualification, SLA.",
    values: {
      probleme: {
        tempsPerdu: { actif: true, heuresParMois: 120, coutHoraireCharge: 10 },
        perteClients: { actif: true, clientsParMois: 3, valeurMoyenneClient: 400 },
      },
      benefices: {
        gainsProductivite: {
          actif: true,
          heuresEconomiseesParMois: 90,
          coutHoraireMoyenCharge: 10,
          coefficientReallocation: 0.55,
          valeurTempsRealloue: 1.2,
        },
        retentionClients: {
          actif: true,
          clientsRetenusParMois: 1.5,
          valeurMoyenneClient: 400,
          coefficientRealisme: 0.4,
        },
      },
    },
  },
};

export function emptyProjectInputs(nom = "Nouveau projet"): ProjectInputs {
  return {
    nom,
    probleme: {
      tempsPerdu: { actif: false, heuresParMois: 0, coutHoraireCharge: 0 },
      erreurs: { actif: false, nombreParMois: 0, coutMoyenParErreur: 0 },
      perteClients: { actif: false, clientsParMois: 0, valeurMoyenneClient: 0 },
    },
    couts: {
      capex: {
        coutSolutionIA: 0,
        coutIntegration: 0,
        coutFormationEquipes: 0,
        coutConduiteChangement: 0,
      },
      opex: {
        consommationApiLLM: 0,
        hebergementCloud: 0,
        maintenance: 0,
        autresCoutsRecurrents: 0,
      },
      tauxActualisation: DEFAULT_WACC,
    },
    benefices: {
      gainsProductivite: {
        actif: false,
        heuresEconomiseesParMois: 0,
        coutHoraireMoyenCharge: 0,
        coefficientReallocation: 0.6,
        valeurTempsRealloue: 1,
      },
      reductionErreurs: {
        actif: false,
        erreursEviteesParMois: 0,
        coutMoyenParErreur: 0,
        coefficientRealisme: 0.5,
      },
      retentionClients: {
        actif: false,
        clientsRetenusParMois: 0,
        valeurMoyenneClient: 0,
        coefficientRealisme: 0.4,
      },
    },
    maturite: {
      fiabiliteDonnees: 0.6,
      simplicitProbleme: 0.6,
      faisabiliteTechnique: "moyenne",
    },
    timeline: {
      courbeMonteeEnCharge: DEFAULT_RAMP_UP,
    },
  };
}
