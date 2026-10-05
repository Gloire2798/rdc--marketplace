/**
 * Rate limiting en mémoire (compatible Edge Runtime)
 * Pour : protection volumétrique globale (middleware)
 */

type Entree = {
  count: number;
  resetAt: number;
};

// Cache en mémoire (par instance)
const cache: Map<string, Entree> = new Map();

/**
 * Configuration des limites
 */
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
  for (const [pattern, config] of Object.entries(LIMITES)) {
    if (pattern !== "default" && route.startsWith(pattern)) {
      return config;
    }
  }
  return LIMITES.default;
}

/**
 * Vérifie et incrémente le compteur (synchrone, pas de DB)
 */
export function verifierRateLimitMemoire(
  route: string,
  cle: string
): { autorise: boolean; retryAfter?: number } {
  const { limite, fenetre } = getLimite(route);
  const maintenant = Date.now();
  const cleComplete = `${cle}:${route}`;

  // Nettoyer le cache de temps en temps (évite la fuite mémoire)
  if (cache.size > 10000) {
    for (const [k, v] of cache.entries()) {
      if (v.resetAt < maintenant) cache.delete(k);
    }
  }

  const entree = cache.get(cleComplete);

  // Pas d'entrée OU expirée → créer
  if (!entree || entree.resetAt < maintenant) {
    cache.set(cleComplete, {
      count: 1,
      resetAt: maintenant + fenetre * 1000,
    });
    return { autorise: true };
  }

  // Sous la limite → incrémenter
  if (entree.count < limite) {
    entree.count += 1;
    return { autorise: true };
  }

  // Bloqué
  const secondes = Math.ceil((entree.resetAt - maintenant) / 1000);
  return { autorise: false, retryAfter: secondes };
}

/**
 * Récupère l'IP
 */
export function getIP(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || null;
              }
