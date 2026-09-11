"use client";

import type { FormEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "@/components/wizard/live-preview";
import type { ProjectInputsForm } from "@/lib/calc/schema";

export function StepFormLayout({
  title,
  description,
  onSubmit,
  liveInputs,
  hasPrevious,
  onPrevious,
  isSubmitting,
  isGoingBack,
  submitLabel = "Suivant →",
  children,
}: {
  title: string;
  description?: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  liveInputs: ProjectInputsForm;
  hasPrevious: boolean;
  onPrevious?: () => void;
  isSubmitting?: boolean;
  isGoingBack?: boolean;
  submitLabel?: string;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">{children}</div>
        <div className="lg:sticky lg:top-6">
          <LivePreview inputs={liveInputs} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        {hasPrevious ? (
          <Button type="button" variant="outline" onClick={onPrevious} disabled={isGoingBack}>
            {isGoingBack ? "…" : "← Précédent"}
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
