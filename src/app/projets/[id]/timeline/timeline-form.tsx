"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { saveProjectStep, autosaveProjectInputs } from "@/lib/actions";
import { getStepNav, type ProjectRow } from "@/lib/wizard-steps";
import { projectInputsSchema, type ProjectInputsForm } from "@/lib/calc/schema";
import { computeProjectResults } from "@/lib/calc/engine";
import { StepFormLayout } from "@/components/wizard/step-form-layout";
import { SliderField } from "@/components/wizard/fields";
import { CashFlowTable } from "@/components/wizard/cash-flow-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPercent } from "@/lib/utils";

export function TimelineForm({ project }: { project: ProjectRow }) {
  const router = useRouter();
  const nav = getStepNav("timeline");
  const [isGoingBack, startBack] = useTransition();

  const form = useForm<ProjectInputsForm>({
    resolver: zodResolver(projectInputsSchema),
    defaultValues: project.inputs,
    mode: "onBlur",
  });
  const { register, control, handleSubmit, watch, formState, getValues } = form;

  const liveInputs = watch();
  const results = computeProjectResults(liveInputs);

  const onSubmit = handleSubmit(async (data) => {
    await saveProjectStep(project.id, { timeline: data.timeline }, "timeline");
    if (nav.next) router.push(`/projets/${project.id}/${nav.next}`);
  });

  const goBack = () => {
    if (!nav.previous) return;
    const values = getValues();
    startBack(async () => {
      await autosaveProjectInputs(project.id, { timeline: values.timeline });
      router.push(`/projets/${project.id}/${nav.previous}`);
    });
  };

  return (
    <StepFormLayout
      title="Timeline — la montée en charge des bénéfices"
      description="Une solution IA délivre rarement 100% de sa valeur dès le premier mois. Cette courbe est volontairement explicite et modifiable — c'est l'hypothèse qui, ailleurs, reste souvent invisible dans le calcul."
      onSubmit={onSubmit}
      liveInputs={liveInputs}
      hasPrevious={!!nav.previous}
      onPrevious={goBack}
      isSubmitting={formState.isSubmitting}
      isGoingBack={isGoingBack}
      submitLabel="Voir les résultats →"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Date de démarrage souhaitée</CardTitle>
          <CardDescription>Optionnel — pour information dans le business case exporté.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-xs flex-col gap-1.5">
            <Label htmlFor="dateDebut">Démarrage visé</Label>
            <Input id="dateDebut" type="date" {...register("timeline.dateDebutSouhaitee")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Courbe de montée en charge</CardTitle>
          <CardDescription>
            % du bénéfice réaliste (après coefficient de maturité) effectivement capté chaque année.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Controller
            control={control}
            name="timeline.courbeMonteeEnCharge.0"
            render={({ field }) => (
              <SliderField
                label="Année 1"
                value={field.value}
                onChange={field.onChange}
                formatValue={(v) => formatPercent(v)}
              />
            )}
          />
          <Controller
            control={control}
            name="timeline.courbeMonteeEnCharge.1"
            render={({ field }) => (
              <SliderField
                label="Année 2"
                value={field.value}
                onChange={field.onChange}
                formatValue={(v) => formatPercent(v)}
              />
            )}
          />
          <Controller
            control={control}
            name="timeline.courbeMonteeEnCharge.2"
            render={({ field }) => (
              <SliderField
                label="Année 3"
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
          <CardTitle className="text-base">Flux de trésorerie résultants</CardTitle>
          <CardDescription>Actualisés au taux défini à l&rsquo;étape Coûts.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <CashFlowTable cashFlows={results.cashFlows} />
        </CardContent>
      </Card>
    </StepFormLayout>
  );
}
