"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { saveProjectStep, autosaveProjectInputs } from "@/lib/actions";
import { getStepNav, type ProjectRow } from "@/lib/wizard-steps";
import { projectInputsSchema, type ProjectInputsForm } from "@/lib/calc/schema";
import { computeMaturityMultiplier, MATURITY_WEIGHTS } from "@/lib/calc/engine";
import { FAISABILITE_LABELS } from "@/lib/calc/defaults";
import { StepFormLayout } from "@/components/wizard/step-form-layout";
import { SliderField } from "@/components/wizard/fields";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fiabilité des données</CardTitle>
          <CardDescription>À quel point les chiffres saisis ci-dessus sont-ils fiables (mesurés vs. estimés à la louche) ?</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Simplicité du problème</CardTitle>
          <CardDescription>Le problème est-il bien circonscrit, ou dépend-il de nombreux cas particuliers ?</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Faisabilité technique</CardTitle>
          <CardDescription>Estimation de la difficulté d&rsquo;intégration technique du projet.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card className="bg-accent/40">
        <CardHeader>
          <CardTitle className="text-base">Formule du coefficient global de maturité</CardTitle>
          <CardDescription>
            Pondération fixe et documentée — appliquée au bénéfice réaliste total pour obtenir le
            bénéfice final utilisé dans les flux de trésorerie.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
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
          <div className="mt-2 flex items-center justify-between border-t pt-2 font-semibold">
            <span>Coefficient global de maturité</span>
            <span className="tabular-nums text-primary">{formatPercent(detail.multiplier)}</span>
          </div>
        </CardContent>
      </Card>
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
