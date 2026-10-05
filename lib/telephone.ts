/**
 * Utilitaires pour la gestion des numéros de téléphone
 * - Normalisation : nettoyer pour stocker un format uniforme
 * - Validation : vérifier que le numéro est plausible
 */

/**
 * Normalise un numéro de téléphone
 * - Enlève espaces, tirets, parenthèses
 * - Convertit tous les formats RDC en format local : 0812345678
 * - Garde les numéros internationaux au format +XXXxxxxxxxxx
 */
export function normaliserTelephone(tel: string): string {
  if (!tel) return "";

  let n = tel.trim();

  // Cas 1 : Numéro international (commence par +)
  if (n.startsWith("+")) {
    const chiffres = n.slice(1).replace(/\D/g, "");
    return "+" + chiffres;
  }

  // Cas 2 : Numéro local ou avec indicatif sans +
  let chiffres = n.replace(/\D/g, "");

  // 00243812345678 → 0812345678
  if (chiffres.startsWith("00243")) {
    chiffres = chiffres.slice(5);
    return "0" + chiffres;
  }
  // 243812345678 → 0812345678
  if (chiffres.startsWith("243")) {
    chiffres = chiffres.slice(3);
    return "0" + chiffres;
  }
  // 812345678 (9 chiffres, pas de 0) → 0812345678
  if (chiffres.length === 9 && !chiffres.startsWith("0")) {
    return "0" + chiffres;
  }

  // Déjà au format 0XXXXXXXXX
  return chiffres;
}

/**
 * Valide un numéro de téléphone
 * RDC : 080-099 + 8 chiffres = 10 chiffres (ou 9 après +243)
 * International : +XXX + 8 à 15 chiffres
 */
export function validerTelephone(tel: string): { valide: boolean; erreur?: string } {
  if (!tel || tel.trim() === "") {
    return { valide: false, erreur: "Numéro de téléphone obligatoire" };
  }

  const brut = tel.trim();

  // Cas 1 : Numéro international (commence par +)
  if (brut.startsWith("+")) {
    const chiffres = brut.slice(1).replace(/\D/g, "");

    if (chiffres.length < 8) {
      return {
        valide: false,
        erreur: "Numéro international trop court (8 chiffres minimum après l'indicatif)",
      };
    }
    if (chiffres.length > 15) {
      return {
        valide: false,
        erreur: "Numéro international trop long (15 chiffres maximum)",
      };
    }
    return { valide: true };
  }

  // Cas 2 : RDC ou local
  const chiffres = brut.replace(/\D/g, "");

  // Détecter le format RDC et extraire le numéro local
  let local = chiffres;
  if (chiffres.startsWith("00243")) local = chiffres.slice(5);
  else if (chiffres.startsWith("243")) local = chiffres.slice(3);
  else if (chiffres.startsWith("0")) local = chiffres.slice(1);

  // Un numéro RDC local doit avoir EXACTEMENT 9 chiffres
  if (local.length < 9) {
    return {
      valide: false,
      erreur: "Numéro trop court. Format attendu : 0812345678 (10 chiffres)",
    };
  }
  if (local.length > 9) {
    return {
      valide: false,
      erreur: "Numéro trop long. Format attendu : 0812345678 (10 chiffres)",
    };
  }

  // Vérifier le préfixe : 080 à 099
  const prefixe = parseInt("0" + local.slice(0, 2));
  if (prefixe < 80 || prefixe > 99) {
    return {
      valide: false,
      erreur: "Préfixe non reconnu. Utilisez un numéro congolais (080 à 099)",
    };
  }

  return { valide: true };
           }
