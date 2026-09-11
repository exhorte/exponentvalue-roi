"use client";

import { computeProjectResults } from "@/lib/calc/engine";
import type { ProjectInputsForm } from "@/lib/calc/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecommendationBadge } from "@/components/recommendation-badge";
import { formatEUR, formatPercent, formatMonths, cn } from "@/lib/utils";

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
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Aperçu en direct
        </CardTitle>
        <CardDescription>Recalculé à chaque saisie — rien n&rsquo;est mis en cache.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
          <span className="text-sm text-muted-foreground">Recommandation</span>
          <RecommendationBadge value={hasData ? r.recommandation : null} />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Coût du problème (an)" value={formatEUR(r.coutProblemeAnnuel)} />
          <Metric label="Investissement initial" value={formatEUR(r.capexTotal)} />
          <Metric label="Bénéfice réaliste (cible/an)" value={formatEUR(r.beneficeRealisteAnnuel)} />
          <Metric label="Coefficient de réalisme" value={formatPercent(r.coefficientRealismeGlobal)} />
          <Metric
            label="ROI net (an 3)"
            value={formatPercent(roiAn3 / 100)}
            tone={hasData ? (roiAn3 >= 0 ? "success" : "destructive") : undefined}
          />
          <Metric label="Délai de récupération" value={formatMonths(r.delaiRecuperationMois)} />
        </dl>

        <div className="rounded-lg border bg-card p-3">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score ARIA</span>
            <span className="font-semibold tabular-nums">{r.score.toFixed(1)} / 20</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                !hasData
                  ? "bg-muted-foreground/30"
                  : r.recommandation === "GO"
                    ? "bg-success"
                    : r.recommandation === "EVALUER"
                      ? "bg-warning"
                      : "bg-destructive"
              )}
              style={{ width: `${Math.min(100, Math.max(0, (r.score / 20) * 100))}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "font-semibold tabular-nums",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
