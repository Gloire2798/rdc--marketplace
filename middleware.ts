import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifierRateLimit, getIP } from "@/lib/rateLimit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Appliquer uniquement sur les routes API
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Ignorer certaines routes (webhooks, cron, etc.)
  if (
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/flush-cache")
  ) {
    return NextResponse.next();
  }

  // Récupérer l'IP
  const ip = getIP(request);

  // Pour les routes sensibles, récupérer le téléphone dans le body
  let identifiant: string | null = null;
  const routesSensibles = [
    "/api/vendeur/connexion",
    "/api/client/inscription",
    "/api/vendeur/inscription",
    "/api/auth/mot-de-passe-oublie",
    "/api/auth/reinitialiser",
  ];

  const estSensible = routesSensibles.some((r) => pathname.startsWith(r));

  if (estSensible && request.method === "POST") {
    try {
      const clone = request.clone();
      const body = await clone.json();
      identifiant = body.telephone || null;
    } catch {
      // Pas grave, on continue avec IP seulement
    }
  }

  // Vérifier le rate limit
  const resultat = await verifierRateLimit(pathname, ip, identifiant);

  if (!resultat.autorise) {
    return NextResponse.json(
      {
        erreur: "Trop de tentatives. Réessayez plus tard.",
        retryAfter: resultat.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(resultat.retryAfter || 60),
        },
      }
    );
  }

  return NextResponse.next();
}

// Ne s'applique qu'aux routes API
export const config = {
  matcher: "/api/:path*",
};
