import { Badge } from "@/components/ui/badge";
import type { Recommandation } from "@/lib/calc/types";

const CONFIG: Record<Recommandation, { label: string; variant: "success" | "warning" | "destructive" }> = {
  GO: { label: "GO", variant: "success" },
  EVALUER: { label: "ÉVALUER", variant: "warning" },
  STOP: { label: "STOP", variant: "destructive" },
};

export function RecommendationBadge({ value }: { value: Recommandation | null | undefined }) {
  if (!value) return <Badge variant="outline">Brouillon</Badge>;
  const c = CONFIG[value];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}
