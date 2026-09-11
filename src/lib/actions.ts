"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { supabaseAdmin } from "@/lib/supabase/server";
import { computeProjectResults } from "@/lib/calc/engine";
import { emptyProjectInputs, SECTOR_PRESETS, type SectorPresetKey } from "@/lib/calc/defaults";
import type { ProjectInputs, ProjectResults } from "@/lib/calc/types";
import { AUTH_COOKIE } from "@/lib/auth-cookie";
import { WIZARD_STEPS, type WizardStep, type ProjectRow } from "@/lib/wizard-steps";

/** Liste des projets pour le Dashboard, triés par dernière modification. */
export async function listProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`listProjects: ${error.message}`);
  return (data ?? []) as unknown as ProjectRow[];
}

/**
 * `cache()` dédoublonne les lectures identiques au sein d'un même rendu
 * serveur : le shell de l'assistant (bandeau + stepper) et la page d'étape
 * appellent tous deux `getProject(id)` sans provoquer deux allers-retours
 * Supabase.
 */
export const getProject = cache(async (id: string): Promise<ProjectRow | null> => {
  const { data, error } = await supabaseAdmin()
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getProject: ${error.message}`);
  return data as unknown as ProjectRow | null;
});

/** Crée un nouveau projet (brouillon vide, ou pré-rempli depuis un préréglage sectoriel) et redirige vers l'étape Contexte. */
export async function createProjectAction(formData: FormData) {
  const nom = String(formData.get("nom") || "Nouveau projet").trim() || "Nouveau projet";
  const presetKey = formData.get("preset") as SectorPresetKey | null;

  let inputs = emptyProjectInputs(nom);
  let secteur: string | null = null;

  if (presetKey && SECTOR_PRESETS[presetKey]) {
    const preset = SECTOR_PRESETS[presetKey];
    inputs = { ...inputs, ...preset.values, nom } as ProjectInputs;
    secteur = preset.label;
  }

  const { data, error } = await supabaseAdmin()
    .from("projects")
    .insert({ nom, secteur, inputs, etape_courante: "contexte", statut: "brouillon" })
    .select("id")
    .single();

  if (error) throw new Error(`createProjectAction: ${error.message}`);

  revalidatePath("/");
  redirect(`/projets/${data.id}/contexte`);
}

/**
 * Fusionne une mise à jour partielle des saisies dans un projet, RECALCULE
 * systématiquement les résultats (le moteur est pur et rapide : aucune
 * raison de laisser les résultats stockés devenir obsolètes), puis avance
 * l'étape courante si on va de l'avant.
 */
export async function saveProjectStep(
  id: string,
  partialInputs: Partial<ProjectInputs>,
  step: WizardStep
): Promise<{ results: ProjectResults }> {
  const existing = await getProject(id);
  if (!existing) throw new Error("Projet introuvable");

  const mergedInputs: ProjectInputs = deepMerge(existing.inputs, partialInputs);
  const results = computeProjectResults(mergedInputs);

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === step);
  const nextStep = WIZARD_STEPS[Math.min(stepIndex + 1, WIZARD_STEPS.length - 1)].key;
  const isLastStep = step === "resultats";

  // Ne jamais faire RECULER le marqueur de progression : si l'utilisateur
  // revient corriger une étape déjà dépassée (ex. étape 2 alors qu'il avait
  // atteint l'étape 5) puis clique sur "Suivant", l'étape courante avance
  // vers l'étape suivante SANS effacer la coche déjà acquise sur les étapes
  // plus loin dans l'assistant.
  const existingIndex = WIZARD_STEPS.findIndex((s) => s.key === existing.etape_courante);
  const nextStepIndex = WIZARD_STEPS.findIndex((s) => s.key === nextStep);
  const etapeCourante = isLastStep
    ? "resultats"
    : nextStepIndex > existingIndex
      ? nextStep
      : existing.etape_courante;

  const { error } = await supabaseAdmin()
    .from("projects")
    .update({
      inputs: mergedInputs,
      results,
      score: results.score,
      recommandation: results.recommandation,
      etape_courante: etapeCourante,
      statut: isLastStep ? "complete" : existing.statut === "complete" ? "complete" : "brouillon",
    })
    .eq("id", id);

  if (error) throw new Error(`saveProjectStep: ${error.message}`);

  revalidatePath(`/projets/${id}`);
  revalidatePath("/");
  return { results };
}

/** Sauvegarde silencieuse (auto-save) sans avancer d'étape ni changer le statut. */
export async function autosaveProjectInputs(
  id: string,
  partialInputs: Partial<ProjectInputs>
): Promise<{ results: ProjectResults }> {
  const existing = await getProject(id);
  if (!existing) throw new Error("Projet introuvable");

  const mergedInputs: ProjectInputs = deepMerge(existing.inputs, partialInputs);
  const results = computeProjectResults(mergedInputs);

  const { error } = await supabaseAdmin()
    .from("projects")
    .update({ inputs: mergedInputs, results, score: results.score, recommandation: results.recommandation })
    .eq("id", id);

  if (error) throw new Error(`autosaveProjectInputs: ${error.message}`);
  return { results };
}

export async function renameProjectAction(id: string, nom: string) {
  const { error } = await supabaseAdmin().from("projects").update({ nom }).eq("id", id);
  if (error) throw new Error(`renameProjectAction: ${error.message}`);
  revalidatePath("/");
  revalidatePath(`/projets/${id}`);
}

export async function deleteProjectAction(formData: FormData) {
  const id = String(formData.get("id"));
  const { error } = await supabaseAdmin().from("projects").delete().eq("id", id);
  if (error) throw new Error(`deleteProjectAction: ${error.message}`);
  revalidatePath("/");
}

/* ------------------------------------------------------------------ */
/* Authentification simple (mot de passe partagé — outil interne)      */
/* ------------------------------------------------------------------ */

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const expected = process.env.APP_PASSWORD;

  if (!expected) {
    throw new Error("APP_PASSWORD n'est pas configuré côté serveur.");
  }

  if (password !== expected) {
    redirect("/login?erreur=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}

/* ------------------------------------------------------------------ */
/* Utilitaire de fusion profonde (un niveau de nesting suffit ici)      */
/* ------------------------------------------------------------------ */

function deepMerge<T>(base: T, patch: Partial<T>): T {
  // `base` est toujours un objet à chaque appel (jamais un tableau) : le seul
  // tableau de `ProjectInputs` est `timeline.courbeMonteeEnCharge`, et la
  // condition ci-dessous l'exclut de la récursion (`!Array.isArray`) pour le
  // remplacer intégralement à la place — donc pas besoin de gérer `base`
  // lui-même comme un tableau.
  const baseRecord = base as unknown as Record<string, unknown>;
  const patchRecord = patch as unknown as Record<string, unknown>;
  const result: Record<string, unknown> = { ...baseRecord };

  for (const key of Object.keys(patchRecord)) {
    const patchValue = patchRecord[key];
    const baseValue = baseRecord?.[key];
    if (
      patchValue &&
      typeof patchValue === "object" &&
      !Array.isArray(patchValue) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        patchValue as Record<string, unknown>
      );
    } else {
      result[key] = patchValue;
    }
  }
  return result as T;
}
