"use client";

import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FormSection } from "@/components/wizard/form-section";
import { cn } from "@/lib/utils";

/** Bloc activable/désactivable pour une catégorie de coût ou de bénéfice. */
export function CategoryCard({
  icon,
  title,
  description,
  active,
  onToggle,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  active: boolean;
  onToggle: (active: boolean) => void;
  children: ReactNode;
}) {
  const switchId = useId();

  return (
    <FormSection
      icon={icon}
      title={title}
      description={description}
      className={cn("transition-colors", !active && "bg-muted/40 shadow-none")}
      contentClassName="grid gap-4 sm:grid-cols-2"
      action={
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <label htmlFor={switchId} className="hidden text-xs text-muted-foreground sm:block">
            {active ? "Activé" : "Désactivé"}
          </label>
          <Switch
            id={switchId}
            checked={active}
            onCheckedChange={onToggle}
            aria-label={`Activer ${title}`}
          />
        </div>
      }
    >
      {active ? children : null}
    </FormSection>
  );
}
