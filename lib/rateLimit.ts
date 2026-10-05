/**
 * Rate limiting en mémoire (compatible Edge Runtime)
 */

type Entree = {
  count: number;
  resetAt: number;
};

const cache: Map<string, Entree> = new Map();

const LIMITES: Record<string, { limite: number; fenetre: number }> = {
  // Routes sensibles
  "/api/vendeur/connexion": { limite: 5, fenetre: 15 * 60 },
  "/api/client/inscription": { limite: 3, fenetre: 24 * 60 * 60 },
  "/api/vendeur/inscription": { limite: 3, fenetre: 24 * 60 * 60 },
  "/api/auth/mot-de-passe-oublie": { limite: 3, fenetre: 60 * 60 },

  // API générale
  "default": { limite: 50, fenetre: 60 },
};

function getLimite(route: string): { limite: number; fenetre: number } {
  const cles = Object.keys(LIMITES);
  for (let i = 0; i < cles.length; i++) {
    const pattern = cles[i];
    if (pattern !== "default" && route.startsWith(pattern)) {
      return LIMITES[pattern];
    }
  }
  return LIMITES.default;
}

export function verifierRateLimitMemoire(
  route: string,
  cle: string
): { autorise: boolean; retryAfter?: number } {
  const { limite, fenetre } = getLimite(route);
  const maintenant = Date.now();
  const cleComplete = `${cle}:${route}`;

  // Nettoyer le cache de temps en temps
  if (cache.size > 10000) {
    cache.forEach((v, k) => {
      if (v.resetAt < maintenant) cache.delete(k);
    });
  }

  const entree = cache.get(cleComplete);

  if (!entree || entree.resetAt < maintenant) {
    cache.set(cleComplete, {
      count: 1,
      resetAt: maintenant + fenetre * 1000,
    });
    return { autorise: true };
  }

  if (entree.count < limite) {
    entree.count += 1;
    return { autorise: true };
  }

  const secondes = Math.ceil((entree.resetAt - maintenant) / 1000);
  return { autorise: false, retryAfter: secondes };
}

export function getIP(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || null;
}

// ✅ Alias pour compatibilité avec l'API connexion
export const verifierRateLimit = verifierRateLimitMemoire;
