"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Database, Puzzle, Sigma, Wrench } from "lucide-react";

import { saveProjectStep, autosaveProjectInputs } from "@/lib/actions";
import { getStepNav, type ProjectRow } from "@/lib/wizard-steps";
import { projectInputsSchema, type ProjectInputsForm } from "@/lib/calc/schema";
import { computeMaturityMultiplier, MATURITY_WEIGHTS } from "@/lib/calc/engine";
import { FAISABILITE_LABELS } from "@/lib/calc/defaults";
import { StepFormLayout } from "@/components/wizard/step-form-layout";
import { SliderField } from "@/components/wizard/fields";
import { FormSection } from "@/components/wizard/form-section";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatPercent } from "@/lib/utils";

export function MaturiteForm({ project }: { project: ProjectRow }) {
  const router = useRouter();
  const nav = getStepNav("maturite");
  const [isGoingBack, startBack] = useTransition();

  const form = useForm<ProjectInputsForm>({
    resolver: zodResolver(projectInputsSchema),
    defaultValues: project.inputs,
    mode: "onBlur",
  });
  const { control, handleSubmit, watch, formState, getValues } = form;

  const liveInputs = watch();
  const maturite = watch("maturite");
  const detail = computeMaturityMultiplier(maturite);

  const onSubmit = handleSubmit(async (data) => {
    await saveProjectStep(project.id, { maturite: data.maturite }, "maturite");
    if (nav.next) router.push(`/projets/${project.id}/${nav.next}`);
  });

  const goBack = () => {
    if (!nav.previous) return;
    const values = getValues();
    startBack(async () => {
      await autosaveProjectInputs(project.id, { maturite: values.maturite });
      router.push(`/projets/${project.id}/${nav.previous}`);
    });
  };

  return (
    <StepFormLayout
      title="Maturité — la confiance dans ces chiffres"
      description="Ces curseurs pondèrent le bénéfice réaliste pour refléter le risque d'exécution. La formule est entièrement visible ci-dessous — aucun multiplicateur caché."
      onSubmit={onSubmit}
      liveInputs={liveInputs}
      hasPrevious={!!nav.previous}
      onPrevious={goBack}
      isSubmitting={formState.isSubmitting}
      isGoingBack={isGoingBack}
    >
      <FormSection
        icon={Database}
        title="Fiabilité des données"
        description="À quel point les chiffres saisis ci-dessus sont-ils fiables (mesurés vs. estimés à la louche) ?"
      >
        <Controller
          control={control}
          name="maturite.fiabiliteDonnees"
          render={({ field }) => (
            <SliderField
              label="Fiabilité"
              value={field.value}
              onChange={field.onChange}
              formatValue={(v) => formatPercent(v)}
            />
          )}
        />
      </FormSection>

      <FormSection
        icon={Puzzle}
        title="Simplicité du problème"
        description="Le problème est-il bien circonscrit, ou dépend-il de nombreux cas particuliers ?"
      >
        <Controller
          control={control}
          name="maturite.simplicitProbleme"
          render={({ field }) => (
            <SliderField
              label="Simplicité"
              value={field.value}
              onChange={field.onChange}
              formatValue={(v) => formatPercent(v)}
            />
          )}
        />
      </FormSection>

      <FormSection
        icon={Wrench}
        title="Faisabilité technique"
        description="Estimation de la difficulté d'intégration technique du projet."
      >
        <Controller
          control={control}
          name="maturite.faisabiliteTechnique"
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value}
              onValueChange={(v) => v && field.onChange(v)}
              className="w-full"
            >
              {(Object.keys(FAISABILITE_LABELS) as (keyof typeof FAISABILITE_LABELS)[]).map((key) => (
                <ToggleGroupItem key={key} value={key} className="flex-1">
                  {FAISABILITE_LABELS[key]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </FormSection>

      <FormSection
        icon={Sigma}
        title="Formule du coefficient global de maturité"
        description="Pondération fixe et documentée — appliquée au bénéfice réaliste total pour obtenir le bénéfice final utilisé dans les flux de trésorerie."
        className="bg-muted/40"
        contentClassName="flex flex-col gap-2.5 text-sm"
      >
        <Row
          label={`Fiabilité des données × ${formatPercent(MATURITY_WEIGHTS.fiabiliteDonnees)}`}
          value={formatPercent(detail.fiabilite * MATURITY_WEIGHTS.fiabiliteDonnees)}
        />
        <Row
          label={`Simplicité du problème × ${formatPercent(MATURITY_WEIGHTS.simplicitProbleme)}`}
          value={formatPercent(detail.simplicite * MATURITY_WEIGHTS.simplicitProbleme)}
        />
        <Row
          label={`Faisabilité technique × ${formatPercent(MATURITY_WEIGHTS.faisabiliteTechnique)}`}
          value={formatPercent(detail.faisabilite * MATURITY_WEIGHTS.faisabiliteTechnique)}
        />
        <div className="mt-1 flex items-center justify-between border-t pt-3 font-semibold">
          <span>Coefficient global de maturité</span>
          <span className="rounded-md bg-primary px-2 py-0.5 text-primary-foreground tabular-nums">
            {formatPercent(detail.multiplier)}
          </span>
        </div>
      </FormSection>
    </StepFormLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>
  );
}
