"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function NumberField({
  label,
  suffix,
  registration,
  error,
  min = 0,
  step = "any",
  className,
}: {
  label: string;
  suffix?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  min?: number;
  step?: number | "any";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={registration.name}>{label}</Label>
      <div className="relative">
        <Input
          id={registration.name}
          type="number"
          min={min}
          step={step}
          inputMode="decimal"
          className={suffix ? "pr-14" : undefined}
          {...registration}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  formatValue,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-sm font-semibold tabular-nums text-primary">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
