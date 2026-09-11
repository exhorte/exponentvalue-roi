import { z } from "zod";

/**
 * Schéma de validation de l'assistant, miroir de `types.ts`.
 *
 * Objectifs volontairement modestes : empêcher les valeurs négatives, et
 * borner les coefficients de réalisme à [0, 1] — pas transformer l'assistant
 * en formulaire strict qui bloque la progression. Chaque bloc reste "requis"
 * dans le schéma car `emptyProjectInputs()` garantit qu'il existe toujours,
 * même désactivé (`actif: false`).
 *
 * Volontairement `z.number()` et non `z.coerce.number()` : chaque champ
 * numérique est déjà remis en `number` AVANT d'atteindre l'état de
 * react-hook-form (`valueAsNumber: true` sur les <input>, valeurs déjà
 * numériques venues des `Slider`), donc rien à coercer. Coercer aurait fait
 * diverger le type d'ENTRÉE du schéma (`unknown`) de son type de SORTIE
 * (`number`), ce que `useForm<ProjectInputsForm>` ne peut pas exprimer
 * proprement avec un seul generic.
 */

const nonNeg = z.number().min(0, "Doit être positif ou nul");
const coefficient01 = z.number().min(0, "Min. 0").max(1, "Max. 1 (100%)");

export const problemCostSchema = z.object({
  tempsPerdu: z.object({
    actif: z.boolean(),
    heuresParMois: nonNeg,
    coutHoraireCharge: nonNeg,
  }),
  erreurs: z.object({
    actif: z.boolean(),
    nombreParMois: nonNeg,
    coutMoyenParErreur: nonNeg,
  }),
  perteClients: z.object({
    actif: z.boolean(),
    clientsParMois: nonNeg,
    valeurMoyenneClient: nonNeg,
  }),
});

export const costInputsSchema = z.object({
  capex: z.object({
    coutSolutionIA: nonNeg,
    coutIntegration: nonNeg,
    coutFormationEquipes: nonNeg,
    coutConduiteChangement: nonNeg,
  }),
  opex: z.object({
    consommationApiLLM: nonNeg,
    hebergementCloud: nonNeg,
    maintenance: nonNeg,
    autresCoutsRecurrents: nonNeg,
  }),
  tauxActualisation: z.number().min(0, "Min. 0%").max(50, "Max. 50%"),
});

export const benefitInputsSchema = z.object({
  gainsProductivite: z.object({
    actif: z.boolean(),
    heuresEconomiseesParMois: nonNeg,
    coutHoraireMoyenCharge: nonNeg,
    coefficientReallocation: coefficient01,
    valeurTempsRealloue: z.number().min(0, "Min. 0").max(5, "Max. 5x"),
  }),
  reductionErreurs: z.object({
    actif: z.boolean(),
    erreursEviteesParMois: nonNeg,
    coutMoyenParErreur: nonNeg,
    coefficientRealisme: coefficient01,
  }),
  retentionClients: z.object({
    actif: z.boolean(),
    clientsRetenusParMois: nonNeg,
    valeurMoyenneClient: nonNeg,
    coefficientRealisme: coefficient01,
  }),
});

export const maturityInputsSchema = z.object({
  fiabiliteDonnees: coefficient01,
  simplicitProbleme: coefficient01,
  faisabiliteTechnique: z.enum(["faible", "moyenne", "elevee"]),
});

export const timelineInputsSchema = z.object({
  dateDebutSouhaitee: z.string().optional(),
  courbeMonteeEnCharge: z.tuple([coefficient01, coefficient01, coefficient01]),
});

export const projectInputsSchema = z.object({
  nom: z.string().min(1, "Le nom du projet est requis"),
  secteur: z.string().optional(),
  probleme: problemCostSchema,
  couts: costInputsSchema,
  benefices: benefitInputsSchema,
  maturite: maturityInputsSchema,
  timeline: timelineInputsSchema,
});

export type ProjectInputsForm = z.infer<typeof projectInputsSchema>;
