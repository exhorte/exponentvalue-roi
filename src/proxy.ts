import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-cookie";

/**
 * Portail d'accès simple (mot de passe partagé) pour un outil interne.
 *
 * Next.js 16 renomme le "Middleware" en "Proxy" (même mécanisme). Ce fichier
 * bloque toute page tant que le cookie evroi_auth ne correspond pas à
 * APP_PASSWORD. Ce n'est PAS une authentification multi-utilisateur — c'est
 * volontairement minimal pour un outil interne à un seul utilisateur (voir
 * le document de stratégie, section décisions ouvertes, pour l'évolution
 * vers un vrai compte si l'outil devient public/multi-utilisateur).
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  const expected = process.env.APP_PASSWORD;
  const cookieValue = request.cookies.get(AUTH_COOKIE)?.value;

  if (!expected || cookieValue !== expected) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
