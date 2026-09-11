"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CashFlowYear } from "@/lib/calc/types";
import { formatEUR } from "@/lib/utils";

export function CashFlowChart({ cashFlows }: { cashFlows: CashFlowYear[] }) {
  const data = cashFlows.map((c) => ({
    name: c.annee === 0 ? "An 0" : `An ${c.annee}`,
    "Flux actualisé": Math.round(c.fluxActualise),
    "Cumul actualisé": Math.round(c.cumulActualise),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" fontSize={12} tickLine={false} />
          <YAxis
            fontSize={12}
            tickLine={false}
            width={90}
            tickFormatter={(v: number) => formatEUR(v, { decimals: 0 })}
          />
          <Tooltip formatter={(value) => formatEUR(Number(value))} />
          <Bar dataKey="Flux actualisé" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="Cumul actualisé"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
