/**
 * Nom du cookie d'authentification partagé (portail mot de passe unique).
 *
 * Fichier séparé exprès : `proxy.ts` (Edge) et `lib/actions.ts` (fichier
 * "use server") en ont tous deux besoin, et un fichier "use server" ne peut
 * exporter que des fonctions async — une constante comme celle-ci doit donc
 * vivre ailleurs pour être importée sans faire échouer le build
 * ("A 'use server' file can only export async functions").
 */
export const AUTH_COOKIE = "evroi_auth";
