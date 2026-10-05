import { cn } from "@/lib/utils";

/** Pastille ronde : courbe exponentielle sur fond quasi-noir, anneau fin autour. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="15.25" className="fill-background stroke-border" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="12.5" className="fill-primary" />
      <path
        d="M8.6 21.2c4.7 0 8.3-.5 10.4-3 1.6-1.9 2.5-4.6 3.1-8"
        fill="none"
        className="stroke-primary-foreground"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="22.1" cy="10.2" r="1.7" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-foreground">ExponentValue</span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">Calculateur ROI</span>
      </span>
    </span>
  );
}
