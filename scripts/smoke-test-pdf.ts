/**
 * Vérifie que le document PDF du Business Case se génère réellement (pas
 * seulement qu'il compile) : on fabrique un ProjectRow avec les résultats
 * déjà calculés par le moteur, on le rend en PDF, et on écrit le fichier
 * pour inspection visuelle.
 */
import { writeFileSync } from "node:fs";
import { renderToBuffer } from "@react-pdf/renderer";
import { computeProjectResults } from "../src/lib/calc/engine";
import { emptyProjectInputs, SECTOR_PRESETS } from "../src/lib/calc/defaults";
import { BusinessCaseDocument } from "../src/lib/pdf/business-case-document";
import type { ProjectRow } from "../src/lib/wizard-steps";

async function main() {
  const preset = SECTOR_PRESETS.customer_ops;
  const inputs = {
    ...emptyProjectInputs("Assistant WhatsApp — Service Client"),
    ...preset.values,
    nom: "Assistant WhatsApp — Service Client",
    couts: {
      capex: {
        coutSolutionIA: 25000,
        coutIntegration: 12000,
        coutFormationEquipes: 4000,
        coutConduiteChangement: 3000,
      },
      opex: {
        consommationApiLLM: 6000,
        hebergementCloud: 2400,
        maintenance: 5000,
        autresCoutsRecurrents: 0,
      },
      tauxActualisation: 10,
    },
  } as ReturnType<typeof emptyProjectInputs>;

  const results = computeProjectResults(inputs);

  const project: ProjectRow = {
    id: "smoke-test-id",
    nom: inputs.nom,
    secteur: preset.label,
    statut: "complete",
    etape_courante: "resultats",
    inputs,
    results,
    score: results.score,
    recommandation: results.recommandation,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const buffer = await renderToBuffer(BusinessCaseDocument({ project }));
  const outPath = "/tmp/business-case-smoke-test.pdf";
  writeFileSync(outPath, buffer);

  console.log(`Score: ${results.score.toFixed(1)}/20 -> ${results.recommandation}`);
  console.log(`PDF généré : ${outPath} (${buffer.length} octets)`);
  console.log(`Magic bytes: ${buffer.subarray(0, 5).toString()}`); // doit afficher "%PDF-"
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
