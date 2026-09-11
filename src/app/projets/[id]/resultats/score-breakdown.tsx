import { Progress } from "@/components/ui/progress";
import type { ScoreBreakdown } from "@/lib/calc/types";

const ROWS: { key: keyof Omit<ScoreBreakdown, "total">; label: string; max: number }[] = [
  { key: "pointsRoi", label: "ROI à 3 ans", max: 8 },
  { key: "pointsPayback", label: "Vitesse de retour (payback)", max: 6 },
  { key: "pointsConfiance", label: "Confiance dans les chiffres (maturité)", max: 4 },
  { key: "pointsFaisabilite", label: "Faisabilité technique", max: 2 },
];

export function ScoreBreakdownPanel({ detail }: { detail: ScoreBreakdown }) {
  return (
    <div className="flex flex-col gap-4">
      {ROWS.map((row) => (
        <div key={row.key} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span>{row.label}</span>
            <span className="font-medium tabular-nums">
              {detail[row.key].toFixed(1)} / {row.max}
            </span>
          </div>
          <Progress value={(Number(detail[row.key]) / row.max) * 100} />
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between border-t pt-3 text-base font-semibold">
        <span>Total — Score ARIA</span>
        <span className="tabular-nums">{detail.total.toFixed(1)} / 20</span>
      </div>
    </div>
  );
}
