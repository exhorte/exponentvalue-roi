"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartHandshake, ShieldCheck, Zap } from "lucide-react";

import { saveProjectStep, autosaveProjectInputs } from "@/lib/actions";
import { getStepNav, type ProjectRow } from "@/lib/wizard-steps";
import { projectInputsSchema, type ProjectInputsForm } from "@/lib/calc/schema";
import { StepFormLayout } from "@/components/wizard/step-form-layout";
import { CategoryCard } from "@/components/wizard/category-card";
import { NumberField, SliderField } from "@/components/wizard/fields";
import { formatPercent } from "@/lib/utils";

export function BeneficesForm({ project }: { project: ProjectRow }) {
  const router = useRouter();
  const nav = getStepNav("benefices");
  const [isGoingBack, startBack] = useTransition();

  const form = useForm<ProjectInputsForm>({
    resolver: zodResolver(projectInputsSchema),
    defaultValues: project.inputs,
    mode: "onBlur",
  });
  const { register, control, handleSubmit, watch, formState, setValue, getValues } = form;

  const liveInputs = watch();
  const gainsActif = watch("benefices.gainsProductivite.actif");
  const erreursActif = watch("benefices.reductionErreurs.actif");
  const retentionActif = watch("benefices.retentionClients.actif");

  const onSubmit = handleSubmit(async (data) => {
    await saveProjectStep(project.id, { benefices: data.benefices }, "benefices");
    if (nav.next) router.push(`/projets/${project.id}/${nav.next}`);
  });

  const goBack = () => {
    if (!nav.previous) return;
    const values = getValues();
    startBack(async () => {
      await autosaveProjectInputs(project.id, { benefices: values.benefices });
      router.push(`/projets/${project.id}/${nav.previous}`);
    });
  };

  return (
    <StepFormLayout
      title="Bénéfices — la valeur créée par la solution IA"
      description="Chaque catégorie a son PROPRE coefficient de réalisme, visible et modifiable : pas de coefficient global caché appliqué à tout le monde en même temps."
      onSubmit={onSubmit}
      liveInputs={liveInputs}
      hasPrevious={!!nav.previous}
      onPrevious={goBack}
      isSubmitting={formState.isSubmitting}
      isGoingBack={isGoingBack}
    >
      <CategoryCard
        icon={Zap}
        title="Gains de productivité"
        description="Temps libéré, réaffecté à un travail à valeur ajoutée."
        active={!!gainsActif}
        onToggle={(v) => setValue("benefices.gainsProductivite.actif", v, { shouldDirty: true })}
      >
        <NumberField
          label="Heures économisées / mois"
          suffix="h/mois"
          registration={register("benefices.gainsProductivite.heuresEconomiseesParMois", {
            valueAsNumber: true,
          })}
          error={formState.errors.benefices?.gainsProductivite?.heuresEconomiseesParMois?.message}
        />
        <NumberField
          label="Coût horaire moyen chargé"
          suffix="€/h"
          registration={register("benefices.gainsProductivite.coutHoraireMoyenCharge", {
            valueAsNumber: true,
          })}
          error={formState.errors.benefices?.gainsProductivite?.coutHoraireMoyenCharge?.message}
        />
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="benefices.gainsProductivite.coefficientReallocation"
            render={({ field }) => (
              <SliderField
                label="Part du temps réellement réaffectée à du travail utile"
                value={field.value}
                onChange={field.onChange}
                formatValue={(v) => formatPercent(v)}
                hint="100% = tout le temps libéré est réinvesti utilement. En pratique, une partie se perd (réunions, latence organisationnelle...)."
              />
            )}
          />
        </div>
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="benefices.gainsProductivite.valeurTempsRealloue"
            render={({ field }) => (
              <SliderField
                label="Valeur relative du temps réalloué"
                value={field.value}
                onChange={field.onChange}
                min={0}
                max={3}
                step={0.1}
                formatValue={(v) => `×${v.toFixed(1)}`}
                hint="1.0 = valeur identique au temps libéré. >1.0 si le temps est réorienté vers des tâches à plus forte valeur (vente, relation client...)."
              />
            )}
          />
        </div>
      </CategoryCard>

      <CategoryCard
        icon={ShieldCheck}
        title="Réduction des erreurs"
        description="Erreurs évitées grâce à l'automatisation."
        active={!!erreursActif}
        onToggle={(v) => setValue("benefices.reductionErreurs.actif", v, { shouldDirty: true })}
      >
        <NumberField
          label="Erreurs évitées / mois"
          suffix="/mois"
          registration={register("benefices.reductionErreurs.erreursEviteesParMois", {
            valueAsNumber: true,
          })}
          error={formState.errors.benefices?.reductionErreurs?.erreursEviteesParMois?.message}
        />
        <NumberField
          label="Coût moyen par erreur"
          suffix="€"
          registration={register("benefices.reductionErreurs.coutMoyenParErreur", {
            valueAsNumber: true,
          })}
          error={formState.errors.benefices?.reductionErreurs?.coutMoyenParErreur?.message}
        />
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="benefices.reductionErreurs.coefficientRealisme"
            render={({ field }) => (
              <SliderField
                label="Coefficient de réalisme"
                value={field.value}
                onChange={field.onChange}
                formatValue={(v) => formatPercent(v)}
                hint="Prudence recommandée : toutes les erreurs évitées en théorie ne se traduisent pas en économie réelle."
              />
            )}
          />
        </div>
      </CategoryCard>

      <CategoryCard
        icon={HeartHandshake}
        title="Rétention de clients"
        description="Clients conservés grâce à une meilleure réactivité ou qualité de service."
        active={!!retentionActif}
        onToggle={(v) => setValue("benefices.retentionClients.actif", v, { shouldDirty: true })}
      >
        <NumberField
          label="Clients retenus / mois"
          suffix="/mois"
          registration={register("benefices.retentionClients.clientsRetenusParMois", {
            valueAsNumber: true,
          })}
          error={formState.errors.benefices?.retentionClients?.clientsRetenusParMois?.message}
        />
        <NumberField
          label="Valeur moyenne / client"
          suffix="€"
          registration={register("benefices.retentionClients.valeurMoyenneClient", {
            valueAsNumber: true,
          })}
          error={formState.errors.benefices?.retentionClients?.valeurMoyenneClient?.message}
        />
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="benefices.retentionClients.coefficientRealisme"
            render={({ field }) => (
              <SliderField
                label="Coefficient de réalisme"
                value={field.value}
                onChange={field.onChange}
                formatValue={(v) => formatPercent(v)}
                hint="La rétention attribuable réellement à la solution est presque toujours partielle — évitez d'en attribuer 100% à l'IA."
              />
            )}
          />
        </div>
      </CategoryCard>
    </StepFormLayout>
  );
}
