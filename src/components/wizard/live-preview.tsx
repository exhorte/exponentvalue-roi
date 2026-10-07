"use client";

import { ArrowUpRight, Gauge, Percent, RefreshCw, Timer } from "lucide-react";

import { computeProjectResults } from "@/lib/calc/engine";
import type { ProjectInputsForm } from "@/lib/calc/schema";
import { RecommendationBadge } from "@/components/recommendation-badge";
import {
  HighlightBar,
  MetricPanel,
  MetricPanelItem,
  MetricPanelList,
} from "@/components/metric-panel";
import { formatEUR, formatPercent, formatMonths, formatScore } from "@/lib/utils";

/**
 * Panneau "Aperçu en direct" : recalcule `computeProjectResults` à CHAQUE
 * frappe (le composant parent re-render sur chaque changement via
 * `form.watch()`). C'est la réponse directe au bug de recalcul différé
 * observé sur le prototype vidéo — aucune valeur affichée ici n'est en
 * cache, tout part des saisies actuelles de l'assistant.
 */
export function LivePreview({ inputs }: { inputs: ProjectInputsForm }) {
  const r = computeProjectResults(inputs);
  const roiAn3 = r.roiParAnnee.at(-1) ?? 0;
  const hasData = r.capexTotal > 0 || r.coutProblemeAnnuel > 0 || r.beneficeBrutAnnuel > 0;

  return (
    <div className="flex flex-col gap-4">
      <HighlightBar
        icon={Gauge}
        value={
          <>
            {formatScore(r.score)}
            <span className="ml-1 text-base font-medium text-panel-muted">/ 20</span>
          </>
        }
        label="Score ARIA"
        aside={<RecommendationBadge value={hasData ? r.recommandation : null} onPanel />}
      />

      <MetricPanel>
        <MetricPanelItem
          label="ROI net (an 3)"
          value={formatPercent(roiAn3 / 100)}
          icon={Percent}
          tone={hasData ? (roiAn3 >= 0 ? "success" : "destructive") : undefined}
        />
        <MetricPanelItem
          label="Bénéfice réaliste (cible / an)"
          value={formatEUR(r.beneficeRealisteAnnuel)}
          icon={ArrowUpRight}
          solidIcon
        />
        <MetricPanelItem
          label="Délai de récupération"
          value={formatMonths(r.delaiRecuperationMois)}
          icon={Timer}
        />
        <MetricPanelList
          items={[
            { label: "Coût du problème (an)", value: formatEUR(r.coutProblemeAnnuel) },
            { label: "Investissement initial", value: formatEUR(r.capexTotal) },
            { label: "OPEX annuel", value: formatEUR(r.opexAnnuelTotal) },
            { label: "Coefficient de réalisme", value: formatPercent(r.coefficientRealismeGlobal) },
          ]}
        />
      </MetricPanel>

      <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
        <RefreshCw className="size-3.5 shrink-0" />
        Aperçu en direct — recalculé à chaque saisie, rien n&rsquo;est mis en cache.
      </p>
    </div>
  );
}
