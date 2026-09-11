import { notFound } from "next/navigation";
import { getProject } from "@/lib/actions";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { TimelineForm } from "./timeline-form";

export const dynamic = "force-dynamic";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <WizardShell project={project} activeStep="timeline">
      <TimelineForm project={project} />
    </WizardShell>
  );
}
