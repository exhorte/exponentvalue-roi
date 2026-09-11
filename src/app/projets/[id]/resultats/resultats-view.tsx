import Link from "next/link";
import { TrendingUp, Coins, Clock3, Gauge } from "lucide-react";

import type { ProjectRow } from "@/lib/wizard-steps";
import { formatEUR, formatPercent, formatMonths } from "@/lib/utils";
import { KpiCard } from "@/components/kpi-card";
import { RecommendationBadge } from "@/components/recommendation-badge";
import { CashFlowTable } from "@/components/wizard/cash-flow-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CashFlowChart } from "./cash-flow-chart";
import { ScoreBreakdownPanel } from "./score-breakdown";
import { ExportPdfButton } from "./export-pdf-button";

export function ResultatsView({ project }: { project: ProjectRow }) {
  const r = project.results!;
  const roiAn3 = r.roiParAnnee.at(-1) ?? 0;
  const vanAn3 = r.vanCumuleeParAnnee.at(-1) ?? 0;
  const hasData = r.capexTotal > 0 || r.coutProblemeAnnuel > 0 || r.beneficeBrutAnnuel > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Résultats & Business Case</h2>
          <p className="text-sm text-muted-foreground">
            Calculé le{" "}
            {new Date(r.calculeLe).toLocaleString("fr-FR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RecommendationBadge value={hasData ? project.recommandation : null} />
          <ExportPdfButton projectId={project.id} />
        </div>
      </div>

      {!hasData && (
        <Card className="border-warning/40 bg-warning/10">
          <CardContent className="py-4 text-sm text-warning-foreground">
            Aucune donnée saisie pour l&rsquo;instant — les chiffres ci-dessous sont à zéro. Reprenez
            l&rsquo;assistant depuis l&rsquo;étape Contexte pour obtenir un vrai résultat.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="ROI net (an 3)"
          value={formatPercent(roiAn3 / 100)}
          icon={TrendingUp}
          tone={hasData ? (roiAn3 >= 0 ? "success" : "destructive") : "default"}
        />
        <KpiCard
          label="VAN cumulée (an 3)"
          value={formatEUR(vanAn3)}
          icon={Coins}
          tone={hasData ? (vanAn3 >= 0 ? "success" : "destructive") : "default"}
        />
        <KpiCard label="Délai de récupération" value={formatMonths(r.delaiRecuperationMois)} icon={Clock3} />
        <KpiCard label="Score ARIA" value={`${r.score.toFixed(1)} / 20`} icon={Gauge} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Le problème vs. la solution</CardTitle>
          <CardDescription>Comparaison annuelle, à pleine charge (Année 3).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Coût actuel du problème (par an, sans rien changer)
            </p>
            <p className="mt-1 text-2xl font-bold text-destructive">{formatEUR(r.coutProblemeAnnuel)}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Bénéfice réaliste attendu (par an, à pleine charge)
            </p>
            <p className="mt-1 text-2xl font-bold text-success">{formatEUR(r.beneficeRealisteAnnuel)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flux de trésorerie sur 3 ans</CardTitle>
          <CardDescription>Flux actualisés (barres) et cumul actualisé (ligne).</CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowChart cashFlows={r.cashFlows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail des flux</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <CashFlowTable cashFlows={r.cashFlows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score ARIA — détail</CardTitle>
          <CardDescription>
            Recommandation : GO à partir de 15/20, ÉVALUER entre 8 et 15, STOP en-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreBreakdownPanel detail={r.scoreDetail} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" asChild>
          <Link href={`/projets/${project.id}/timeline`}>← Précédent</Link>
        </Button>
        <Button asChild>
          <Link href="/">Retour au dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
