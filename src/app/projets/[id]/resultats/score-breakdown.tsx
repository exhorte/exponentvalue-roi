import { Progress } from "@/components/ui/progress";
import type { ScoreBreakdown } from "@/lib/calc/types";
import { formatScore } from "@/lib/utils";

const ROWS: { key: keyof Omit<ScoreBreakdown, "total">; label: string; max: number }[] = [
  { key: "pointsRoi", label: "ROI à 3 ans", max: 8 },
  { key: "pointsPayback", label: "Vitesse de retour (payback)", max: 6 },
  { key: "pointsConfiance", label: "Confiance dans les chiffres (maturité)", max: 4 },
  { key: "pointsFaisabilite", label: "Faisabilité technique", max: 2 },
];

export function ScoreBreakdownPanel({ detail }: { detail: ScoreBreakdown }) {
  return (
    <div className="flex flex-col gap-5">
      {ROWS.map((row) => (
        <div key={row.key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium tabular-nums">
              {formatScore(detail[row.key])} <span className="text-muted-foreground">/ {row.max}</span>
            </span>
          </div>
          <Progress value={(Number(detail[row.key]) / row.max) * 100} className="h-1.5" />
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between border-t pt-4 text-sm font-semibold">
        <span>Total — Score ARIA</span>
        <span className="rounded-md bg-primary px-2 py-0.5 text-primary-foreground tabular-nums">
          {formatScore(detail.total)} / 20
        </span>
      </div>
    </div>
  );
}
