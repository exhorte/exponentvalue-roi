import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté serveur, avec la clé service_role.
 *
 * IMPORTANT : `import "server-only"` fait échouer le build si ce fichier est
 * jamais importé depuis un composant client — la clé service_role ne doit
 * JAMAIS atteindre le navigateur. Toutes les lectures/écritures passent par
 * les Server Actions de `src/lib/actions.ts`.
 *
 * La table `projects` a RLS activé SANS policy (voir la migration
 * `create_projects_table`) : seule cette clé service_role (qui contourne RLS)
 * peut y accéder. C'est voulu — voir la Décision n°2 dans le README.
 */
function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies (voir .env.local.example)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let cached: SupabaseClient | null = null;

export function supabaseAdmin() {
  if (!cached) cached = getSupabaseAdmin();
  return cached;
}
