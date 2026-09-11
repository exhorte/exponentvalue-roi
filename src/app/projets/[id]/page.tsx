import { notFound, redirect } from "next/navigation";
import { getProject } from "@/lib/actions";

export const dynamic = "force-dynamic";

/** Redirige vers l'étape courante du projet — utile pour un lien "nu" vers /projets/{id}. */
export default async function ProjectRootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  redirect(`/projets/${id}/${project.etape_courante ?? "contexte"}`);
}
