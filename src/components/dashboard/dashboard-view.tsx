import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, Coins, FolderKanban, Percent } from "lucide-react";

import type { ProjectRow } from "@/lib/wizard-steps";
import type { Recommandation } from "@/lib/calc/types";
import { formatEUR, formatPercent, formatScore, formatShortDate, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { HighlightBar, MetricPanel, MetricPanelItem } from "@/components/metric-panel";
import { Callout } from "@/components/callout";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { ProjectsList } from "@/components/dashboard/projects-list";

function computeStats(projects: ProjectRow[]) {
  const scored = projects.filter((p) => p.results);
  const withScore = projects.filter((p) => p.score != null);
  const count = (r: Recommandation) => projects.filter((p) => p.recommandation === r).length;

  return {
    roiMoyen: scored.length
      ? scored.reduce((s, p) => s + (p.results!.roiParAnnee.at(-1) ?? 0), 0) / scored.length / 100
      : 0,
    vanTotale: scored.reduce((s, p) => s + (p.results!.vanCumuleeParAnnee.at(-1) ?? 0), 0),
    scoreMoyen: withScore.length
      ? withScore.reduce((s, p) => s + (p.score ?? 0), 0) / withScore.length
      : 0,
    go: count("GO"),
    evaluer: count("EVALUER"),
    stop: count("STOP"),
    brouillons: projects.filter((p) => p.statut === "brouillon").length,
    meilleur: withScore.reduce<ProjectRow | null>(
      (best, p) => (!best || (p.score ?? 0) > (best.score ?? 0) ? p : best),
      null
    ),
  };
}

export function DashboardView({ projects }: { projects: ProjectRow[] }) {
  const stats = computeStats(projects);

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <PageHeader
            title="Tableau de bord"
            subtitle={
              projects.length > 0
                ? `${projects.length} projet${projects.length > 1 ? "s" : ""} · pilotez vos projets d'intelligence artificielle`
                : "Pilotez vos projets d'intelligence artificielle"
            }
          />
          {projects.length === 0 ? (
            <EmptyProjects />
          ) : (
            <PortfolioCard projects={projects} stats={stats} />
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <HighlightBar icon={Coins} value={formatEUR(stats.vanTotale)} label="VAN totale · an 3" />
          <MetricPanel>
            <MetricPanelItem
              label="ROI moyen (an 3)"
              value={formatPercent(stats.roiMoyen)}
              icon={Percent}
              hint="Moyenne des projets calculés"
            />
            <MetricPanelItem
              label="Projets GO"
              value={stats.go}
              unit={`/ ${projects.length}`}
              icon={ArrowUpRight}
              solidIcon
            />
            <MetricPanelItem
              label="Score ARIA moyen"
              value={formatScore(stats.scoreMoyen)}
              unit="/ 20"
              icon={Activity}
            />
          </MetricPanel>
        </div>
      </div>

      {projects.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="projets-recents">
          <PageHeader
            title={
              <h2 id="projets-recents" className="text-xl font-semibold tracking-tight">
                Projets récents
              </h2>
            }
            subtitle="Triés par dernière modification"
            icon={FolderKanban}
          />
          <ProjectsList projects={projects} />
        </section>
      )}

      <Callout title="Important">
        Chaque nombre affiché est traçable jusqu&rsquo;à sa formule : un coefficient de réalisme
        par catégorie de bénéfice, un coefficient de maturité pondéré et une courbe de montée en
        charge explicite. Recommandation GO à partir de 15/20, ÉVALUER entre 8 et 15, STOP
        en-dessous.
      </Callout>
    </div>
  );
}

function PortfolioCard({
  projects,
  stats,
}: {
  projects: ProjectRow[];
  stats: ReturnType<typeof computeStats>;
}) {
  const totalNotes = stats.go + stats.evaluer + stats.stop;
  const recent = projects[0];
  const segments = [
    { label: "GO", value: stats.go, dot: "bg-success" },
    { label: "ÉVALUER", value: stats.evaluer, dot: "bg-warning" },
    { label: "STOP", value: stats.stop, dot: "bg-destructive" },
  ];

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="grid grid-cols-3 divide-x border-b bg-muted/40">
        {segments.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 py-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              <span className={cn("size-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
            <span className="text-xl font-semibold tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 p-6">
        <div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium">Répartition des recommandations</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {totalNotes} / {projects.length} notés
            </span>
          </div>
          <div className="mt-3 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-secondary">
            {totalNotes > 0 &&
              segments
                .filter((s) => s.value > 0)
                .map((s) => (
                  <div
                    key={s.label}
                    className={s.dot}
                    style={{ width: `${(s.value / totalNotes) * 100}%` }}
                    title={`${s.label} : ${s.value}`}
                  />
                ))}
          </div>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href={`/projets/${recent.id}/${recent.etape_courante}`}>
            <span className="min-w-0 truncate">Reprendre « {recent.nom} »</span>
            <ArrowRight />
          </Link>
        </Button>

        <dl className="flex flex-col gap-3 text-sm">
          <Row
            label="Projet le mieux noté"
            value={
              stats.meilleur
                ? `${stats.meilleur.nom} (${formatScore(stats.meilleur.score ?? 0)}/20)`
                : "—"
            }
          />
          <Row label="Brouillons en cours" value={stats.brouillons} />
          <Row label="Projets calculés" value={`${totalNotes} / ${projects.length}`} />
          <Row label="Dernière activité" value={formatShortDate(recent.updated_at)} />
        </dl>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function EmptyProjects() {
  return (
    <Card className="items-center gap-0 px-6 py-14 text-center">
      <div className="relative flex size-28 items-center justify-center">
        <Sparkle className="absolute top-1 left-2 size-4" />
        <Sparkle className="absolute top-0 right-3 size-3" />
        <Sparkle className="absolute right-0 bottom-5 size-3.5" />
        <Sparkle className="absolute bottom-2 left-4 size-2.5" />
        <FolderKanban className="size-14 stroke-[1.25]" />
      </div>
      <NewProjectDialog>
        <Button variant="outline" size="lg" className="mt-6 min-w-52">
          Créer un projet
        </Button>
      </NewProjectDialog>
      <p className="mt-3 text-xs text-muted-foreground">
        Chiffrez votre premier cas d&rsquo;usage IA en quelques minutes.
      </p>
    </Card>
  );
}

/** Étoile décorative à 4 branches (illustration de l'état vide). */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("fill-muted-foreground/25", className)} aria-hidden="true">
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
    </svg>
  );
}
