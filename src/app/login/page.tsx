import { ArrowRight, Check, ChartColumn, Gauge, Lock, SlidersHorizontal } from "lucide-react";

import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Hypothèses visibles",
    text: "Un coefficient de réalisme par catégorie, une montée en charge explicite.",
  },
  {
    icon: Gauge,
    title: "Score ARIA sur 20",
    text: "ROI, vitesse de retour, confiance et faisabilité — entièrement décomposé.",
  },
  {
    icon: ChartColumn,
    title: "Business case exportable",
    text: "Flux actualisés, VAN, payback et recommandation, prêts pour un comité.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Connexion</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="size-3.5" />
              Outil interne ExponentValue — accès restreint.
            </p>

            <form action={loginAction} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoFocus
                  aria-invalid={erreur ? true : undefined}
                  aria-describedby={erreur ? "password-error" : undefined}
                />
                {erreur && (
                  <p id="password-error" className="text-sm text-destructive">
                    Mot de passe incorrect.
                  </p>
                )}
              </div>
              <Button type="submit" size="lg" className="w-full">
                Entrer
                <ArrowRight />
              </Button>
            </form>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ExponentValue | Tous droits réservés
        </p>
      </div>

      <aside className="m-3 hidden flex-col justify-between rounded-2xl bg-panel p-10 text-panel-foreground lg:flex">
        <p className="text-sm text-panel-muted">Calculateur ROI</p>

        <div>
          <p className="max-w-md text-3xl leading-tight font-semibold tracking-tight">
            Chaque nombre affiché est traçable jusqu&rsquo;à sa formule.
          </p>
          <ul className="mt-10 flex flex-col divide-y divide-panel-border border-y border-panel-border">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-4 py-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <f.icon className="size-4" />
                </span>
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="mt-1 text-sm text-panel-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ul className="flex items-center gap-5 text-xs text-panel-muted">
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-panel-foreground" /> Formules traçables
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="size-3.5 text-panel-foreground" /> Données hébergées en UE
          </li>
        </ul>
      </aside>
    </main>
  );
}
