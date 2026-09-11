import { notFound } from "next/navigation";
import { getProject } from "@/lib/actions";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { CoutsForm } from "./couts-form";

export const dynamic = "force-dynamic";

export default async function CoutsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <WizardShell project={project} activeStep="couts">
      <CoutsForm project={project} />
    </WizardShell>
  );
}
