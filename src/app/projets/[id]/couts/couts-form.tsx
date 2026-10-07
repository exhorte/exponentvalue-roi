"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, Percent, Repeat } from "lucide-react";

import { saveProjectStep, autosaveProjectInputs } from "@/lib/actions";
import { getStepNav, type ProjectRow } from "@/lib/wizard-steps";
import { projectInputsSchema, type ProjectInputsForm } from "@/lib/calc/schema";
import { StepFormLayout } from "@/components/wizard/step-form-layout";
import { NumberField, SliderField } from "@/components/wizard/fields";
import { FormSection } from "@/components/wizard/form-section";
import { formatPercent } from "@/lib/utils";

export function CoutsForm({ project }: { project: ProjectRow }) {
  const router = useRouter();
  const nav = getStepNav("couts");
  const [isGoingBack, startBack] = useTransition();

  const form = useForm<ProjectInputsForm>({
    resolver: zodResolver(projectInputsSchema),
    defaultValues: project.inputs,
    mode: "onBlur",
  });
  const { register, control, handleSubmit, watch, formState, getValues } = form;
  const liveInputs = watch();

  const onSubmit = handleSubmit(async (data) => {
    await saveProjectStep(project.id, { couts: data.couts }, "couts");
    if (nav.next) router.push(`/projets/${project.id}/${nav.next}`);
  });

  const goBack = () => {
    if (!nav.previous) return;
    const values = getValues();
    startBack(async () => {
      await autosaveProjectInputs(project.id, { couts: values.couts });
      router.push(`/projets/${project.id}/${nav.previous}`);
    });
  };

  return (
    <StepFormLayout
      title="Coûts — l'investissement total (TCO)"
      description="Dépenses initiales (CAPEX, engagées une fois) et dépenses récurrentes (OPEX, chaque année de l'exploitation). Tous les montants OPEX sont saisis en montant ANNUEL."
      onSubmit={onSubmit}
      liveInputs={liveInputs}
      hasPrevious={!!nav.previous}
      onPrevious={goBack}
      isSubmitting={formState.isSubmitting}
      isGoingBack={isGoingBack}
    >
      <FormSection
        icon={Landmark}
        title="Investissement initial (CAPEX)"
        description="Engagé une seule fois, avant le démarrage (Année 0)."
        contentClassName="grid gap-4 sm:grid-cols-2"
      >
        <NumberField
          label="Solution IA (licence, dev)"
          suffix="€"
          registration={register("couts.capex.coutSolutionIA", { valueAsNumber: true })}
          error={formState.errors.couts?.capex?.coutSolutionIA?.message}
        />
        <NumberField
          label="Intégration & paramétrage"
          suffix="€"
          registration={register("couts.capex.coutIntegration", { valueAsNumber: true })}
          error={formState.errors.couts?.capex?.coutIntegration?.message}
        />
        <NumberField
          label="Formation des équipes"
          suffix="€"
          registration={register("couts.capex.coutFormationEquipes", { valueAsNumber: true })}
          error={formState.errors.couts?.capex?.coutFormationEquipes?.message}
        />
        <NumberField
          label="Conduite du changement"
          suffix="€"
          registration={register("couts.capex.coutConduiteChangement", { valueAsNumber: true })}
          error={formState.errors.couts?.capex?.coutConduiteChangement?.message}
        />
      </FormSection>

      <FormSection
        icon={Repeat}
        title="Coûts récurrents (OPEX)"
        description="Chaque année d'exploitation — montants annuels."
        contentClassName="grid gap-4 sm:grid-cols-2"
      >
        <NumberField
          label="Consommation API LLM"
          suffix="€/an"
          registration={register("couts.opex.consommationApiLLM", { valueAsNumber: true })}
          error={formState.errors.couts?.opex?.consommationApiLLM?.message}
        />
        <NumberField
          label="Hébergement cloud"
          suffix="€/an"
          registration={register("couts.opex.hebergementCloud", { valueAsNumber: true })}
          error={formState.errors.couts?.opex?.hebergementCloud?.message}
        />
        <NumberField
          label="Maintenance"
          suffix="€/an"
          registration={register("couts.opex.maintenance", { valueAsNumber: true })}
          error={formState.errors.couts?.opex?.maintenance?.message}
        />
        <NumberField
          label="Autres coûts récurrents"
          suffix="€/an"
          registration={register("couts.opex.autresCoutsRecurrents", { valueAsNumber: true })}
          error={formState.errors.couts?.opex?.autresCoutsRecurrents?.message}
        />
      </FormSection>

      <FormSection
        icon={Percent}
        title="Taux d'actualisation (WACC)"
        description="Utilisé pour ramener les flux futurs à leur valeur actuelle (VAN, ROI actualisé, payback)."
      >
        <Controller
          control={control}
          name="couts.tauxActualisation"
          render={({ field }) => (
            <SliderField
              label="Taux annuel"
              value={field.value}
              onChange={field.onChange}
              min={0}
              max={25}
              step={0.5}
              formatValue={(v) => formatPercent(v / 100, 1)}
            />
          )}
        />
      </FormSection>
    </StepFormLayout>
  );
}
