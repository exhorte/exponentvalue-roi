import {
  CalendarRange,
  ChartColumn,
  Gauge,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { WizardStep } from "@/lib/wizard-steps";

/** Icône associée à chaque étape de l'assistant (barre latérale, en-têtes). */
export const STEP_ICONS: Record<WizardStep, LucideIcon> = {
  contexte: Target,
  couts: Wallet,
  benefices: TrendingUp,
  maturite: Gauge,
  timeline: CalendarRange,
  resultats: ChartColumn,
};
