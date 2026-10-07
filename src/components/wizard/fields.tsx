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
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={registration.name} className="text-[13px] text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={registration.name}
          type="number"
          min={min}
          step={step}
          inputMode="decimal"
          placeholder="0"
          aria-invalid={error ? true : undefined}
          className={cn("tabular-nums", suffix && "pr-20")}
          {...registration}
        />
        {suffix && (
          <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[13px] text-muted-foreground">{label}</Label>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground tabular-nums">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        aria-label={label}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
