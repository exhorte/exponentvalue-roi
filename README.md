# Calculateur ROI — ExponentValue

Outil interne : transformer un projet IA en business case chiffré (coûts,
bénéfices, ROI, VAN, payback, score de faisabilité) en quelques minutes,
avec un export PDF prêt pour un comité de direction.

Conçu pour remplacer un prototype vidéo par un outil réel, persistant, et
dont **chaque nombre affiché est traçable jusqu'à sa formule** — pas de
coefficient global caché. Le raisonnement complet (diagnostic du prototype
d'origine, méthodologie financière, recommandations produit) est dans
`Calculateur ROI - Analyse et Strategie.md` (livré séparément).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) — voir `AGENTS.md` /
  `node_modules/next/dist/docs/` avant de toucher aux conventions du
  framework, plusieurs choses ont changé depuis les versions précédentes
  (le middleware s'appelle désormais `proxy.ts`, etc.).
- **Tailwind CSS v4** + composants UI façon shadcn, écrits à la main avec
  Radix UI (le CLI `shadcn` est bloqué par la politique réseau de
  l'environnement de build d'origine — les composants dans
  `src/components/ui/` restent compatibles avec le CLI si l'accès est
  rétabli un jour : `components.json` est déjà configuré).
- **Supabase** (Postgres) pour la persistance — un projet dédié
  `exponentvalue-roi` (région `eu-west-3`), RLS activé **sans policy** :
  seule la clé `service_role`, utilisée uniquement côté serveur, peut lire
  ou écrire dans la table `projects`.
- **react-hook-form + zod** pour les formulaires de l'assistant, avec
  recalcul instantané côté client à chaque saisie (voir plus bas).
- **Recharts** pour le graphique de flux de trésorerie.
- **@react-pdf/renderer** pour l'export du business case en PDF.
- Portail d'accès à mot de passe unique (`APP_PASSWORD`) — volontairement
  minimal pour un outil interne à un seul utilisateur, pas une vraie
  authentification multi-comptes.

## Démarrer en local

```bash
npm install
cp .env.local.example .env.local
# renseigner SUPABASE_SERVICE_ROLE_KEY dans .env.local (voir ci-dessous)
npm run dev
```

Ouvrir http://localhost:3000 — mot de passe = valeur de `APP_PASSWORD` dans
`.env.local`.

### Récupérer la clé Supabase `service_role`

Aucun outil ne l'expose automatiquement (barrière de sécurité volontaire).
À récupérer manuellement :

1. https://supabase.com/dashboard/project/rgxlxvfckemhegmpykco/settings/api
2. Section **Project API keys** → `service_role` → **Reveal** → copier.
3. Coller dans `SUPABASE_SERVICE_ROLE_KEY` (`.env.local` en local, variable
   d'environnement du projet Vercel en production).

Cette clé contourne les Row Level Security policies : elle ne doit **jamais**
être exposée côté client (pas de préfixe `NEXT_PUBLIC_`), et n'est importée
que dans `src/lib/supabase/server.ts`, protégé par `import "server-only"`.

### Scripts utiles

```bash
npm run build        # build de production (Turbopack)
npm run lint          # ESLint
npm run smoke-test    # vérifie le moteur de calcul contre des valeurs connues
npx tsx scripts/smoke-test-pdf.ts   # génère un PDF de test dans /tmp
```

## Architecture

```
src/
  lib/calc/
    types.ts       — types des saisies et des résultats (source de vérité)
    engine.ts       — moteur de calcul PUR (aucun effet de bord), documenté
                      section par section : coût du problème, CAPEX/OPEX,
                      bénéfices par catégorie, coefficient de maturité,
                      flux de trésorerie actualisés, ROI, payback, score ARIA
    schema.ts       — validation zod (miroir de types.ts)
    defaults.ts     — valeurs par défaut + préréglages sectoriels
  lib/actions.ts    — Server Actions : CRUD projets, sauvegarde par étape
                      (recalcule systématiquement, jamais de cache obsolète),
                      auth par mot de passe
  lib/wizard-steps.ts — définition des 6 étapes (séparé de actions.ts car un
                      fichier "use server" ne peut exporter que des fonctions
                      async)
  lib/pdf/          — document PDF du business case (polices PDF standard
                      uniquement — aucune police téléchargée à la génération)
  app/
    page.tsx                    — Dashboard (KPIs agrégés, liste des projets)
    login/                      — écran de mot de passe
    projets/[id]/
      contexte, couts, benefices, maturite, timeline, resultats/
                                 — les 6 étapes de l'assistant
    api/projets/[id]/pdf/       — génération du PDF à la volée
  proxy.ts          — portail d'accès (renommage Next 16 de "middleware")
```

### Pourquoi chaque nombre est traçable

Le prototype d'origine appliquait un coefficient de réalisme global unique
et une courbe de montée en charge invisible dans le calcul (voir le document
de stratégie pour le diagnostic complet). Ce moteur corrige les deux :

- **Un coefficient de réalisme par catégorie de bénéfice** (productivité,
  erreurs, rétention), pas un seul chiffre appliqué à tout.
- **Un coefficient de maturité documenté et pondéré** (fiabilité des
  données 40%, simplicité du problème 35%, faisabilité technique 25%),
  affiché en détail à l'étape Maturité — jamais une boîte noire.
- **Une courbe de montée en charge explicite et modifiable** (étape
  Timeline), au lieu d'une hypothèse enfouie dans le code.
- **Un score ARIA (/20) entièrement décomposé** (ROI /8, vitesse de retour
  /6, confiance /4, faisabilité /2), visible en détail à l'étape Résultats
  et dans le PDF exporté.

### Calcul en direct, sans latence

Chaque étape de l'assistant est un Client Component. `computeProjectResults`
(le même moteur pur utilisé côté serveur) tourne aussi dans le navigateur,
alimenté par `react-hook-form`'s `watch()` : le panneau "Aperçu en direct"
se recalcule à chaque frappe, sans aller-retour serveur. La persistance
Supabase se fait séparément, au clic sur "Suivant" (ou "Précédent", qui
sauvegarde aussi avant de reculer) — jamais la source du nombre affiché.

## Déploiement

Déployé sur Vercel (voir les notes de livraison pour l'URL et l'organisation
du dépôt de code). Variables d'environnement requises côté Vercel :
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_PASSWORD`.
# ExponentValue ROI
