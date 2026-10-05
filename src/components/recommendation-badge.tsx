import { Badge } from "@/components/ui/badge";
import type { Recommandation } from "@/lib/calc/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  Recommandation,
  { label: string; variant: "success" | "warning" | "destructive"; dot: string; panel: string }
> = {
  GO: {
    label: "GO",
    variant: "success",
    dot: "bg-success",
    panel: "border-panel-success/30 bg-panel-success/15 text-panel-success",
  },
  EVALUER: {
    label: "ÉVALUER",
    variant: "warning",
    dot: "bg-warning",
    panel: "border-panel-warning/30 bg-panel-warning/15 text-panel-warning",
  },
  STOP: {
    label: "STOP",
    variant: "destructive",
    dot: "bg-destructive",
    panel: "border-panel-destructive/30 bg-panel-destructive/15 text-panel-destructive",
  },
};

/**
 * Badge GO / ÉVALUER / STOP. `onPanel` adapte les couleurs pour un fond
 * sombre (panneau de métriques), où les teintes standard manqueraient de contraste.
 */
export function RecommendationBadge({
  value,
  onPanel = false,
  className,
}: {
  value: Recommandation | null | undefined;
  onPanel?: boolean;
  className?: string;
}) {
  if (!value) {
    return (
      <Badge
        variant="outline"
        className={cn(onPanel && "border-panel-border text-panel-muted", className)}
      >
        <span className="size-1.5 rounded-full bg-current" />
        Brouillon
      </Badge>
    );
  }
  const c = CONFIG[value];
  return (
    <Badge variant={c.variant} className={cn(onPanel && c.panel, className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {c.label}
    </Badge>
  );
}

/** Pastille d'état pour la barre supérieure : recommandation + score. */
export function StatusPill({
  recommandation,
  score,
  className,
}: {
  recommandation: Recommandation | null | undefined;
  score: number | null | undefined;
  className?: string;
}) {
  const c = recommandation ? CONFIG[recommandation] : null;
  return (
    <span
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border bg-muted/60 px-3 text-xs font-medium",
        className
      )}
    >
      <span className={cn("size-2 rounded-full", c ? c.dot : "bg-muted-foreground/50")} />
      {c ? c.label : "Brouillon"}
      {c && score != null && (
        <span className="text-muted-foreground tabular-nums">· {score.toFixed(1)}/20</span>
      )}
    </span>
  );
}
