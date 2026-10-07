import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  ChartColumn,
  Clock,
  Coins,
  Gauge,
  LayoutDashboard,
  Percent,
  Scale,
  Table2,
  Timer,
  type LucideIcon,
} from "lucide-react";

import type { ProjectRow } from "@/lib/wizard-steps";
import { formatEUR, formatPercent, formatMonths, formatScore, cn } from "@/lib/utils";
import { RecommendationBadge } from "@/components/recommendation-badge";
import {
  HighlightBar,
  MetricPanel,
  MetricPanelItem,
  MetricPanelList,
} from "@/components/metric-panel";
import { Callout } from "@/components/callout";
import { CashFlowTable } from "@/components/wizard/cash-flow-table";
import { FormSection, SectionHeader } from "@/components/wizard/form-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CashFlowChart } from "./cash-flow-chart";
import { ScoreBreakdownPanel } from "./score-breakdown";
import { ExportPdfButton } from "./export-pdf-button";

export function ResultatsView({ project }: { project: ProjectRow }) {
  const r = project.results!;
  const roiAn3 = r.roiParAnnee.at(-1) ?? 0;
  const vanAn3 = r.vanCumuleeParAnnee.at(-1) ?? 0;
  const hasData = r.capexTotal > 0 || r.coutProblemeAnnuel > 0 || r.beneficeBrutAnnuel > 0;
  const tone = (v: number) => (hasData ? (v >= 0 ? "success" : "destructive") : undefined);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Résultats & Business Case</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              Calculé le{" "}
              {new Date(r.calculeLe).toLocaleString("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <ExportPdfButton projectId={project.id} />
        </div>

        {!hasData && (
          <Callout variant="warning" title="Aucune donnée saisie">
            Les chiffres ci-dessous sont à zéro. Reprenez l&rsquo;assistant depuis l&rsquo;étape
            Contexte pour obtenir un vrai résultat.
          </Callout>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-3">
            <FormSection
              icon={Scale}
              title="Le problème vs. la solution"
              description="Comparaison annuelle, à pleine charge (Année 3)."
              contentClassName="flex flex-col gap-5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <StatTile
                  label="Coût actuel du problème"
                  sub="Par an, sans rien changer"
                  value={formatEUR(r.coutProblemeAnnuel)}
                  icon={ArrowDownRight}
                  tone="destructive"
                />
                <StatTile
                  label="Bénéfice réaliste attendu"
                  sub="Par an, à pleine charge"
                  value={formatEUR(r.beneficeRealisteAnnuel)}
                  icon={ArrowUpRight}
                  tone="success"
                />
              </div>
              <dl className="flex flex-col gap-3 text-sm">
                <Row label="Investissement initial (CAPEX)" value={formatEUR(r.capexTotal)} />
                <Row label="Coûts récurrents (OPEX / an)" value={formatEUR(r.opexAnnuelTotal)} />
                <Row label="Bénéfice brut (avant réalisme)" value={formatEUR(r.beneficeBrutAnnuel)} />
                <Row
                  label="Coefficient de réalisme global"
                  value={formatPercent(r.coefficientRealismeGlobal)}
                />
              </dl>
            </FormSection>

            <FormSection
              icon={Gauge}
              title="Score ARIA — détail"
              description="Recommandation : GO à partir de 15/20, ÉVALUER entre 8 et 15, STOP en-dessous."
            >
              <ScoreBreakdownPanel detail={r.scoreDetail} />
            </FormSection>
          </div>

          <div className="order-first flex flex-col gap-4 lg:sticky lg:top-24 lg:order-none lg:col-span-2">
            <HighlightBar
              icon={Gauge}
              value={
                <>
                  {formatScore(r.score)}
                  <span className="ml-1 text-base font-medium text-panel-muted">/ 20</span>
                </>
              }
              label="Score ARIA"
              aside={<RecommendationBadge value={hasData ? project.recommandation : null} onPanel />}
            />
            <MetricPanel>
              <MetricPanelItem
                label="ROI net (an 3)"
                value={formatPercent(roiAn3 / 100)}
                icon={Percent}
                tone={tone(roiAn3)}
              />
              <MetricPanelItem
                label="VAN cumulée (an 3)"
                value={formatEUR(vanAn3)}
                icon={Coins}
                solidIcon
                tone={tone(vanAn3)}
              />
              <MetricPanelItem
                label="Délai de récupération"
                value={formatMonths(r.delaiRecuperationMois)}
                icon={Timer}
              />
              <MetricPanelList
                items={r.roiParAnnee.slice(0, -1).flatMap((roi, i) => [
                  { label: `ROI an ${i + 1}`, value: formatPercent(roi / 100) },
                  { label: `VAN cumulée an ${i + 1}`, value: formatEUR(r.vanCumuleeParAnnee[i] ?? 0) },
                ])}
              />
            </MetricPanel>
          </div>
        </div>
      </div>

      <section className="flex flex-col" aria-label="Flux de trésorerie sur 3 ans">
        <SectionHeader
          icon={ChartColumn}
          title="Flux de trésorerie sur 3 ans"
          description="Flux actualisés (barres) et cumul actualisé (ligne)."
          className="px-0 pt-0 pb-4"
        />
        <Card className="px-3 py-5 sm:px-5">
          <CashFlowChart cashFlows={r.cashFlows} />
        </Card>
      </section>

      <section className="flex flex-col" aria-label="Détail des flux">
        <SectionHeader
          icon={Table2}
          title="Détail des flux"
          description="Flux bruts, actualisés et cumul, de l'investissement (An 0) à l'Année 3."
          className="px-0 pt-0 pb-4"
        />
        <CashFlowTable cashFlows={r.cashFlows} />
      </section>

      <Callout title="Important">
        Les flux sont actualisés au taux défini à l&rsquo;étape Coûts et suivent la courbe de montée
        en charge de l&rsquo;étape Timeline. Modifier une hypothèse dans l&rsquo;assistant recalcule
        l&rsquo;ensemble du business case.
      </Callout>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        <Button variant="outline" size="lg" asChild>
          <Link href={`/projets/${project.id}/timeline`}>
            <ArrowLeft />
            Précédent
          </Link>
        </Button>
        <Button size="lg" asChild>
          <Link href="/">
            <LayoutDashboard />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>
    </div>
  );
}

function StatTile({
  label,
  sub,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  sub: string;
  value: string;
  icon: LucideIcon;
  tone: "success" | "destructive";
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            tone === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={cn(
          "mt-3 text-2xl font-semibold tracking-tight tabular-nums",
          tone === "success" ? "text-success" : "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
