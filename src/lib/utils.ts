import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatte un nombre en euros, format français (ex. "12 345,67 €"). */
export function formatEUR(value: number, opts: { decimals?: number } = {}) {
  const { decimals = 0 } = opts;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Formatte un nombre en pourcentage, format français (ex. "12,3 %"). */
export function formatPercent(value: number, decimals = 1) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Formatte un nombre de mois de façon lisible (ex. "24,7 mois"). */
export function formatMonths(value: number | null | undefined) {
  if (!Number.isFinite(value)) return "Non atteint sur 3 ans";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value as number)} mois`;
}
