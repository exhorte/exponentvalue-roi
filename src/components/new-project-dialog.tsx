"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Plus } from "lucide-react";

import { createProjectAction } from "@/lib/actions";
import { SECTOR_PRESETS } from "@/lib/calc/defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STARTING_POINTS = [
  { value: "", label: "Partir de zéro", description: "Toutes les saisies à zéro, à compléter étape par étape." },
  ...Object.entries(SECTOR_PRESETS).map(([key, preset]) => ({
    value: key,
    label: preset.label,
    description: preset.description,
  })),
];

/**
 * Dialogue de création de projet. Sans `children`, affiche le bouton noir
 * "Nouveau projet" ; sinon `children` sert de déclencheur.
 */
export function NewProjectDialog({ children }: { children?: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="max-sm:w-9 max-sm:px-0">
            <Plus />
            <span className="max-sm:sr-only">Nouveau projet</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau projet</DialogTitle>
          <DialogDescription>
            Pars de zéro, ou charge un préréglage sectoriel pour aller plus vite.
          </DialogDescription>
        </DialogHeader>

        <form action={createProjectAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-project-nom">Nom du projet</Label>
            <Input
              id="new-project-nom"
              name="nom"
              placeholder="Ex. Automatisation des devis"
              required
              autoFocus
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Point de départ</legend>
            {STARTING_POINTS.map((option, i) => (
              <label
                key={option.value || "zero"}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                  "hover:bg-muted/50 has-[input:checked]:border-foreground has-[input:checked]:bg-muted/40",
                  "has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/40"
                )}
              >
                <input
                  type="radio"
                  name="preset"
                  value={option.value}
                  defaultChecked={i === 0}
                  className="mt-0.5 size-4 shrink-0 accent-foreground"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Création…" : "Créer le projet"}
      {!pending && <ArrowRight />}
    </Button>
  );
}
