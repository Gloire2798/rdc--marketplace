import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifierRateLimitMemoire, getIP } from "@/lib/rateLimit";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Uniquement les routes API
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Ignorer certaines routes
  if (
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/flush-cache")
  ) {
    return NextResponse.next();
  }

  // Récupérer l'IP
  const ip = getIP(request) || "unknown";

  // Vérifier la limite globale
  const resultat = verifierRateLimitMemoire(pathname, ip);

  if (!resultat.autorise) {
    return NextResponse.json(
      {
        erreur: "Trop de requêtes. Réessayez dans quelques instants.",
        retryAfter: resultat.retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(resultat.retryAfter || 60) },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
