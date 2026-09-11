/**
 * Test rapide et manuel du moteur de calcul, avec des valeurs reprises de la
 * vidéo de démonstration du prototype de référence, pour vérifier que la
 * partie "brute" du calcul reproduit bien les mêmes montants qu'un calcul à
 * la main (150h x 45€ x 12 = 81 000€, puis x0.6x1.5 = 72 900€).
 */
import { computeProjectResults } from "../src/lib/calc/engine";
import { emptyProjectInputs } from "../src/lib/calc/defaults";

const inputs = emptyProjectInputs("Test fumée");
inputs.probleme.tempsPerdu = { actif: true, heuresParMois: 320, coutHoraireCharge: 35 };
inputs.couts.capex = {
  coutSolutionIA: 40000,
  coutIntegration: 15000,
  coutFormationEquipes: 3000,
  coutConduiteChangement: 2000,
};
inputs.couts.opex.maintenance = 9000;
inputs.couts.tauxActualisation = 10;
inputs.benefices.gainsProductivite = {
  actif: true,
  heuresEconomiseesParMois: 150,
  coutHoraireMoyenCharge: 45,
  coefficientReallocation: 0.6,
  valeurTempsRealloue: 1.5,
};
inputs.maturite = { fiabiliteDonnees: 0.6, simplicitProbleme: 0.6, faisabiliteTechnique: "moyenne" };

const results = computeProjectResults(inputs);

console.log("Coût du problème (annuel):", results.coutProblemeAnnuel, "attendu 134400");
console.log("CAPEX total:", results.capexTotal, "attendu 60000");
console.log("Bénéfice brut annuel:", results.beneficeBrutAnnuel, "attendu 81000");
console.log("Bénéfice réaliste (avant maturité):", 81000 * 0.6 * 1.5, "= 72900 (catégorie)");
console.log("Coefficient global de maturité:", results.coefficientRealismeGlobal);
console.log("Bénéfice réaliste final (après maturité):", results.beneficeRealisteAnnuel);
console.log("Cash flows:", results.cashFlows);
console.log("ROI par année (%):", results.roiParAnnee);
console.log("VAN cumulée par année:", results.vanCumuleeParAnnee);
console.log("Délai de récupération (mois):", results.delaiRecuperationMois);
console.log("Score ARIA:", results.score, results.scoreDetail, "->", results.recommandation);
