"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

/** Bloc activable/désactivable pour une catégorie de coût ou de bénéfice. */
export function CategoryCard({
  title,
  description,
  active,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  active: boolean;
  onToggle: (active: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Card className={cn("transition-opacity", !active && "opacity-60")}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Toggle
          pressed={active}
          onPressedChange={onToggle}
          variant="outline"
          size="sm"
          aria-label={`Activer ${title}`}
          className="shrink-0 data-[state=on]:bg-success data-[state=on]:text-success-foreground"
        >
          {active ? "Activé" : "Désactivé"}
        </Toggle>
      </CardHeader>
      {active && <CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent>}
    </Card>
  );
}
