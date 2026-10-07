import type { CashFlowYear } from "@/lib/calc/types";
import { formatEUR, cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CashFlowTable({ cashFlows }: { cashFlows: CashFlowYear[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Période</TableHead>
          <TableHead className="text-right">Flux brut</TableHead>
          <TableHead className="text-right">Flux actualisé</TableHead>
          <TableHead className="text-right">Cumul actualisé</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cashFlows.map((c) => (
          <TableRow key={c.annee}>
            <TableCell className="font-medium">
              {c.annee === 0 ? "Investissement (An 0)" : `Année ${c.annee}`}
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatEUR(c.fluxBrut)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatEUR(c.fluxActualise)}</TableCell>
            <TableCell
              className={cn(
                "text-right font-semibold tabular-nums",
                c.cumulActualise >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {formatEUR(c.cumulActualise)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
