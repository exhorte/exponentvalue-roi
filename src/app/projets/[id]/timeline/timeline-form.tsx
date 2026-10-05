"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Table2, TrendingUp } from "lucide-react";

import { saveProjectStep, autosaveProjectInputs } from "@/lib/actions";
import { getStepNav, type ProjectRow } from "@/lib/wizard-steps";
import { projectInputsSchema, type ProjectInputsForm } from "@/lib/calc/schema";
import { computeProjectResults } from "@/lib/calc/engine";
import { StepFormLayout } from "@/components/wizard/step-form-layout";
import { SliderField } from "@/components/wizard/fields";
import { CashFlowTable } from "@/components/wizard/cash-flow-table";
import { FormSection, SectionHeader } from "@/components/wizard/form-section";
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
      submitLabel="Voir les résultats"
    >
      <FormSection
        icon={CalendarDays}
        title="Date de démarrage souhaitée"
        description="Optionnel — pour information dans le business case exporté."
      >
        <div className="flex max-w-xs flex-col gap-1.5">
          <Label htmlFor="dateDebut" className="text-[13px] text-muted-foreground">
            Démarrage visé
          </Label>
          <Input id="dateDebut" type="date" {...register("timeline.dateDebutSouhaitee")} />
        </div>
      </FormSection>

      <FormSection
        icon={TrendingUp}
        title="Courbe de montée en charge"
        description="% du bénéfice réaliste (après coefficient de maturité) effectivement capté chaque année."
        contentClassName="flex flex-col gap-6"
      >
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
      </FormSection>

      <div className="flex flex-col">
        <SectionHeader
          icon={Table2}
          title="Flux de trésorerie résultants"
          description="Actualisés au taux défini à l'étape Coûts."
          className="px-0 pt-2 pb-4"
        />
        <CashFlowTable cashFlows={results.cashFlows} />
      </div>
    </StepFormLayout>
  );
}
