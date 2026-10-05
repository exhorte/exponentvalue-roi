import { Activity } from "lucide-react";

import { listProjects } from "@/lib/actions";
import { formatShortDate } from "@/lib/utils";
import { AppShell, HeaderInfo } from "@/components/layout/app-shell";
import { NewProjectDialog } from "@/components/new-project-dialog";
import { DashboardView } from "@/components/dashboard/dashboard-view";

// Toujours recalculer côté serveur à chaque visite : ce dashboard doit
// refléter l'état exact de la base, jamais une version mise en cache.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await listProjects();

  return (
    <AppShell
      headerInfo={
        <HeaderInfo icon={Activity}>
          {projects.length > 0
            ? `Dernière activité · ${formatShortDate(projects[0].updated_at)}`
            : "Aucun projet pour l'instant"}
        </HeaderInfo>
      }
      headerActions={<NewProjectDialog />}
    >
      <DashboardView projects={projects} />
    </AppShell>
  );
}
