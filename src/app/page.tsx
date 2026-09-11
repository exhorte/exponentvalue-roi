import Link from "next/link";
import { FolderKanban, CheckCircle2, TrendingUp, Coins, Plus } from "lucide-react";

import { listProjects, createProjectAction, logoutAction } from "@/lib/actions";
import { SECTOR_PRESETS } from "@/lib/calc/defaults";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/kpi-card";
import { RecommendationBadge } from "@/components/recommendation-badge";
import { formatEUR, formatPercent } from "@/lib/utils";

// Toujours recalculer côté serveur à chaque visite : ce dashboard doit
// refléter l'état exact de la base, jamais une version mise en cache.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await listProjects();
  const scored = projects.filter((p) => p.results);

  const roiMoyen = scored.length
    ? scored.reduce((s, p) => s + (p.results!.roiParAnnee.at(-1) ?? 0), 0) / scored.length / 100
    : 0;
  const vanTotale = scored.reduce((s, p) => s + (p.results!.vanCumuleeParAnnee.at(-1) ?? 0), 0);
  const goCount = projects.filter((p) => p.recommandation === "GO").length;
  const evaluerCount = projects.filter((p) => p.recommandation === "EVALUER").length;
  const stopCount = projects.filter((p) => p.recommandation === "STOP").length;
  const totalNotes = goCount + evaluerCount + stopCount;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Pilotez vos projets d&rsquo;intelligence artificielle.
          </p>
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm">
            Se déconnecter
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Projets" value={projects.length} icon={FolderKanban} />
        <KpiCard label="Projets GO" value={goCount} icon={CheckCircle2} tone="success" />
        <KpiCard label="ROI Moyen (an 3)" value={formatPercent(roiMoyen)} icon={TrendingUp} />
        <KpiCard label="VAN Totale" value={formatEUR(vanTotale)} icon={Coins} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Répartition des recommandations</CardTitle>
          <CardDescription>
            {totalNotes > 0
              ? `${totalNotes} sur ${projects.length} projet(s) ont un score calculé.`
              : "Aucun projet noté pour l'instant — complétez l'assistant jusqu'à l'étape Résultats."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalNotes > 0 ? (
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
              {goCount > 0 && (
                <div
                  className="bg-success"
                  style={{ width: `${(goCount / totalNotes) * 100}%` }}
                  title={`GO: ${goCount}`}
                />
              )}
              {evaluerCount > 0 && (
                <div
                  className="bg-warning"
                  style={{ width: `${(evaluerCount / totalNotes) * 100}%` }}
                  title={`ÉVALUER: ${evaluerCount}`}
                />
              )}
              {stopCount > 0 && (
                <div
                  className="bg-destructive"
                  style={{ width: `${(stopCount / totalNotes) * 100}%` }}
                  title={`STOP: ${stopCount}`}
                />
              )}
            </div>
          ) : (
            <div className="h-3 w-full rounded-full bg-secondary" />
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success" /> GO ({goCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-warning" /> ÉVALUER ({evaluerCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-destructive" /> STOP ({stopCount})
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouveau projet</CardTitle>
          <CardDescription>
            Pars de zéro, ou charge un préréglage sectoriel pour aller plus vite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProjectAction} className="flex flex-col gap-3 sm:flex-row">
            <Input name="nom" placeholder="Nom du projet" required className="sm:flex-1" />
            <select
              name="preset"
              defaultValue=""
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-64"
            >
              <option value="">Partir de zéro</option>
              {Object.entries(SECTOR_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.label}
                </option>
              ))}
            </select>
            <Button type="submit" className="gap-1.5">
              <Plus className="size-4" /> Créer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projets récents</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {projects.length === 0 ? (
            <p className="px-6 pb-4 text-sm text-muted-foreground">
              Aucun projet pour l&rsquo;instant — crée le premier ci-dessus.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>ROI (an 3)</TableHead>
                  <TableHead>Dernière modification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link
                        href={`/projets/${p.id}/${p.etape_courante}`}
                        className="font-medium hover:underline"
                      >
                        {p.nom}
                      </Link>
                      {p.secteur && (
                        <div className="text-xs text-muted-foreground">{p.secteur}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <RecommendationBadge value={p.recommandation} />
                    </TableCell>
                    <TableCell>{p.score != null ? `${p.score.toFixed(1)}/20` : "—"}</TableCell>
                    <TableCell>
                      {p.results ? formatPercent((p.results.roiParAnnee.at(-1) ?? 0) / 100) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
