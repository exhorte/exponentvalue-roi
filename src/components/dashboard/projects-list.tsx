import Link from "next/link";

import type { ProjectRow } from "@/lib/wizard-steps";
import { formatEUR, formatPercent, formatScore, formatShortDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecommendationBadge } from "@/components/recommendation-badge";

function initials(nom: string) {
  return (
    nom
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}

function ProjectAvatar({ nom }: { nom: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold ring-1 ring-border">
      {initials(nom)}
    </span>
  );
}

function projectFigures(p: ProjectRow) {
  return {
    href: `/projets/${p.id}/${p.etape_courante}`,
    score: p.score != null ? `${formatScore(p.score)}/20` : "—",
    roi: p.results ? formatPercent((p.results.roiParAnnee.at(-1) ?? 0) / 100) : "—",
    van: p.results ? formatEUR(p.results.vanCumuleeParAnnee.at(-1) ?? 0) : "—",
    date: formatShortDate(p.updated_at),
  };
}

/** Tableau à en-tête sombre sur desktop, cartes empilées sur mobile. */
export function ProjectsList({ projects }: { projects: ProjectRow[] }) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projet</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">ROI (an 3)</TableHead>
              <TableHead className="text-right">VAN (an 3)</TableHead>
              <TableHead>Modifié</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => {
              const f = projectFigures(p);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProjectAvatar nom={p.nom} />
                      <div className="min-w-0">
                        <Link href={f.href} className="block max-w-64 truncate font-medium hover:underline">
                          {p.nom}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.secteur ?? "Sur mesure"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RecommendationBadge value={p.recommandation} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{f.score}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.roi}</TableCell>
                  <TableCell className="text-right tabular-nums">{f.van}</TableCell>
                  <TableCell className="text-muted-foreground">{f.date}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={f.href}>Ouvrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {projects.map((p) => {
          const f = projectFigures(p);
          return (
            <li key={p.id} className="rounded-xl border bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <ProjectAvatar nom={p.nom} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.nom}</p>
                  <p className="text-xs text-muted-foreground">{p.secteur ?? "Sur mesure"}</p>
                </div>
                <RecommendationBadge value={p.recommandation} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <MobileFigure label="Score" value={f.score} />
                <MobileFigure label="ROI (an 3)" value={f.roi} />
                <MobileFigure label="Modifié" value={f.date} />
              </dl>
              <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
                <Link href={f.href}>Ouvrir le projet</Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function MobileFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
