"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Clock, UserMinus } from "lucide-react";

import { saveProjectStep, autosaveProjectInputs } from "@/lib/actions";
import { getStepNav, type ProjectRow } from "@/lib/wizard-steps";
import { projectInputsSchema, type ProjectInputsForm } from "@/lib/calc/schema";
import { StepFormLayout } from "@/components/wizard/step-form-layout";
import { CategoryCard } from "@/components/wizard/category-card";
import { NumberField } from "@/components/wizard/fields";

export function ContexteForm({ project }: { project: ProjectRow }) {
  const router = useRouter();
  const nav = getStepNav("contexte");
  const [isGoingBack, startBack] = useTransition();

  const form = useForm<ProjectInputsForm>({
    resolver: zodResolver(projectInputsSchema),
    defaultValues: project.inputs,
    mode: "onBlur",
  });
  const { register, handleSubmit, watch, formState, setValue, getValues } = form;

  const liveInputs = watch();
  const tempsPerduActif = watch("probleme.tempsPerdu.actif");
  const erreursActif = watch("probleme.erreurs.actif");
  const perteClientsActif = watch("probleme.perteClients.actif");

  const onSubmit = handleSubmit(async (data) => {
    await saveProjectStep(project.id, { probleme: data.probleme }, "contexte");
    if (nav.next) router.push(`/projets/${project.id}/${nav.next}`);
  });

  const goBack = () => {
    if (!nav.previous) return;
    const values = getValues();
    startBack(async () => {
      await autosaveProjectInputs(project.id, { probleme: values.probleme });
      router.push(`/projets/${project.id}/${nav.previous}`);
    });
  };

  return (
    <StepFormLayout
      title="Contexte — le coût actuel du problème"
      description="Avant de parler d'IA : combien ce problème coûte-t-il par an, aujourd'hui, sans rien changer ? C'est la ligne de base par rapport à laquelle tout le reste du dossier sera jugé."
      onSubmit={onSubmit}
      liveInputs={liveInputs}
      hasPrevious={!!nav.previous}
      onPrevious={goBack}
      isSubmitting={formState.isSubmitting}
      isGoingBack={isGoingBack}
    >
      <CategoryCard
        icon={Clock}
        title="Temps perdu"
        description="Heures passées chaque mois sur des tâches manuelles répétitives."
        active={!!tempsPerduActif}
        onToggle={(v) => setValue("probleme.tempsPerdu.actif", v, { shouldDirty: true })}
      >
        <NumberField
          label="Heures perdues / mois"
          suffix="h/mois"
          registration={register("probleme.tempsPerdu.heuresParMois", { valueAsNumber: true })}
          error={formState.errors.probleme?.tempsPerdu?.heuresParMois?.message}
        />
        <NumberField
          label="Coût horaire chargé"
          suffix="€/h"
          registration={register("probleme.tempsPerdu.coutHoraireCharge", { valueAsNumber: true })}
          error={formState.errors.probleme?.tempsPerdu?.coutHoraireCharge?.message}
        />
      </CategoryCard>

      <CategoryCard
        icon={CircleAlert}
        title="Erreurs & corrections"
        description="Erreurs humaines qui coûtent du temps ou de l'argent à corriger."
        active={!!erreursActif}
        onToggle={(v) => setValue("probleme.erreurs.actif", v, { shouldDirty: true })}
      >
        <NumberField
          label="Erreurs / mois"
          suffix="/mois"
          registration={register("probleme.erreurs.nombreParMois", { valueAsNumber: true })}
          error={formState.errors.probleme?.erreurs?.nombreParMois?.message}
        />
        <NumberField
          label="Coût moyen par erreur"
          suffix="€"
          registration={register("probleme.erreurs.coutMoyenParErreur", { valueAsNumber: true })}
          error={formState.errors.probleme?.erreurs?.coutMoyenParErreur?.message}
        />
      </CategoryCard>

      <CategoryCard
        icon={UserMinus}
        title="Perte de clients"
        description="Clients perdus à cause de la lenteur ou de la qualité de service actuelle."
        active={!!perteClientsActif}
        onToggle={(v) => setValue("probleme.perteClients.actif", v, { shouldDirty: true })}
      >
        <NumberField
          label="Clients perdus / mois"
          suffix="/mois"
          registration={register("probleme.perteClients.clientsParMois", { valueAsNumber: true })}
          error={formState.errors.probleme?.perteClients?.clientsParMois?.message}
        />
        <NumberField
          label="Valeur moyenne / client"
          suffix="€"
          registration={register("probleme.perteClients.valeurMoyenneClient", { valueAsNumber: true })}
          error={formState.errors.probleme?.perteClients?.valeurMoyenneClient?.message}
        />
      </CategoryCard>
    </StepFormLayout>
  );
}
