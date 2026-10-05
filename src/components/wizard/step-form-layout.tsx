"use client";

import type { FormEventHandler, ReactNode } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
  submitLabel = "Suivant",
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
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="mb-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </div>
        <div className="lg:sticky lg:top-24 lg:col-span-2">
          <LivePreview inputs={liveInputs} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-6">
        {hasPrevious ? (
          <Button type="button" variant="outline" size="lg" onClick={onPrevious} disabled={isGoingBack}>
            {isGoingBack ? <Loader2 className="animate-spin" /> : <ArrowLeft />}
            Précédent
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
