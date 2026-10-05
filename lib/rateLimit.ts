import { prisma } from "@/lib/prisma";

/**
 * Configuration des limites par route
 * - limite : nombre max de requêtes dans la fenêtre
 * - fenetre : durée en secondes
 */
const LIMITES: Record<string, { limite: number; fenetre: number }> = {
  // Routes sensibles : TRÈS STRICTES
  "/api/vendeur/connexion": { limite: 5, fenetre: 15 * 60 },
  "/api/client/inscription": { limite: 3, fenetre: 24 * 60 * 60 },
  "/api/vendeur/inscription": { limite: 3, fenetre: 24 * 60 * 60 },
  "/api/auth/mot-de-passe-oublie": { limite: 3, fenetre: 60 * 60 },
  "/api/auth/reinitialiser": { limite: 5, fenetre: 60 * 60 },

  // API générale : SOUPLE
  "default": { limite: 50, fenetre: 60 },
};

/**
 * Récupère la config de limite pour une route donnée
 */
function getLimite(route: string): { limite: number; fenetre: number } {
  for (const [pattern, config] of Object.entries(LIMITES)) {
    if (pattern !== "default" && route.startsWith(pattern)) {
      return config;
    }
  }
  return LIMITES.default;
}

/**
 * Vérifie si une requête est autorisée
 * Retourne { autorise: true } ou { autorise: false, retryAfter: secondes }
 */
export async function verifierRateLimit(
  route: string,
  ip: string | null,
  identifiant: string | null = null
): Promise<{ autorise: boolean; retryAfter?: number }> {
  const { limite, fenetre } = getLimite(route);
  const maintenant = new Date();

  try {
    // Nettoyer les vieilles entrées expirées (1 fois sur 10 appels)
    if (Math.random() < 0.1) {
      await prisma.tentative.deleteMany({
        where: { expireAt: { lt: maintenant } },
      });
    }

    // Chercher une entrée existante pour cette IP + route
    const filtre = identifiant
      ? { identifiant, route }
      : { ip, route };

    const existante = await prisma.tentative.findFirst({
      where: filtre,
      orderBy: { createdAt: "desc" },
    });

    // Cas 1 : pas d'entrée OU entrée expirée → créer une nouvelle
    if (!existante || existante.expireAt < maintenant) {
      if (existante) {
        // Supprimer l'ancienne si expirée
        await prisma.tentative.delete({ where: { id: existante.id } });
      }

      await prisma.tentative.create({
        data: {
          ip,
          identifiant,
          route,
          count: 1,
          expireAt: new Date(maintenant.getTime() + fenetre * 1000),
        },
      });

      return { autorise: true };
    }

    // Cas 2 : entrée existe, incrémenter
    if (existante.count < limite) {
      await prisma.tentative.update({
        where: { id: existante.id },
        data: { count: existante.count + 1 },
      });
      return { autorise: true };
    }

    // Cas 3 : limite atteinte → bloquer
    const secondesRestantes = Math.ceil(
      (existante.expireAt.getTime() - maintenant.getTime()) / 1000
    );
    return { autorise: false, retryAfter: secondesRestantes };
  } catch (error) {
    console.error("Erreur rate limit:", error);
    // En cas d'erreur, on laisse passer (pas de blocage strict)
    return { autorise: true };
  }
}

/**
 * Récupère l'IP du client depuis les headers
 */
export function getIP(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return null;
        }
