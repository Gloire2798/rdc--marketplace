const LIMITES: Record<string, { limite: number; fenetre: number }> = {
  // Routes sensibles (par téléphone)
  "/api/vendeur/connexion": { limite: 5, fenetre: 15 * 60 },
  "/api/client/inscription": { limite: 3, fenetre: 24 * 60 * 60 },
  "/api/vendeur/inscription": { limite: 3, fenetre: 24 * 60 * 60 },
  "/api/auth/mot-de-passe-oublie": { limite: 3, fenetre: 60 * 60 },

  // ✅ NOUVEAU : Routes par IP (large)
  "/api/vendeur/connexion-ip": { limite: 30, fenetre: 15 * 60 },
  "/api/client/inscription-ip": { limite: 20, fenetre: 24 * 60 * 60 },
  "/api/vendeur/inscription-ip": { limite: 10, fenetre: 24 * 60 * 60 },
  "/api/auth/mot-de-passe-oublie-ip": { limite: 10, fenetre: 60 * 60 },

  "default": { limite: 50, fenetre: 60 },
};
