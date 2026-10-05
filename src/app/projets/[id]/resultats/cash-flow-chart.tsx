"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CashFlowYear } from "@/lib/calc/types";
import { formatEUR } from "@/lib/utils";

const COLORS = {
  positive: "hsl(var(--chart-1))",
  negative: "hsl(var(--chart-2))",
  cumul: "hsl(var(--chart-3))",
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
};

/** Abrège les montants des axes (ex. "120 k€") pour garder des graduations lisibles. */
function formatAxis(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value) + " €";
}

export function CashFlowChart({ cashFlows }: { cashFlows: CashFlowYear[] }) {
  const data = cashFlows.map((c) => ({
    name: c.annee === 0 ? "An 0" : `An ${c.annee}`,
    "Flux actualisé": Math.round(c.fluxActualise),
    "Cumul actualisé": Math.round(c.cumulActualise),
  }));

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: COLORS.positive }} />
          Flux actualisé positif
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: COLORS.negative }} />
          Flux actualisé négatif
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ background: COLORS.cumul }} />
          Cumul actualisé
        </li>
      </ul>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: COLORS.axis }}
              dy={6}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fill: COLORS.axis }}
              tickFormatter={(v: number) => formatAxis(v)}
            />
            <ReferenceLine y={0} stroke={COLORS.axis} strokeOpacity={0.4} />
            <Tooltip
              formatter={(value) => formatEUR(Number(value))}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.6 }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
                color: "hsl(var(--popover-foreground))",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar dataKey="Flux actualisé" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={d["Flux actualisé"] >= 0 ? COLORS.positive : COLORS.negative}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="Cumul actualisé"
              stroke={COLORS.cumul}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
