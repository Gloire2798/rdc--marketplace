export interface ArticlePanier {
  produitId: string;
  vendeurId: string;
  nom: string;
  prix: number;
  prixPromo: number | null;
  devise: string;
  photo: string | null;
  quantite: number;
  nomBoutique: string;
}

const CLE_PANIER = "gk_sensei_panier";

export function getPanier(): ArticlePanier[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CLE_PANIER);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function sauvegarderPanier(panier: ArticlePanier[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
  window.dispatchEvent(new Event("panier-mis-a-jour"));
}

export function ajouterAuPanier(article: Omit<ArticlePanier, "quantite">) {
  const panier = getPanier();
  const existant = panier.find((a) => a.produitId === article.produitId);

  if (existant) {
    existant.quantite += 1;
  } else {
    panier.push({ ...article, quantite: 1 });
  }

  sauvegarderPanier(panier);
}

export function changerQuantite(produitId: string, quantite: number) {
  const panier = getPanier();
  const article = panier.find((a) => a.produitId === produitId);

  if (article) {
    if (quantite <= 0) {
      retirerDuPanier(produitId);
      return;
    }
    article.quantite = quantite;
    sauvegarderPanier(panier);
  }
}

export function retirerDuPanier(produitId: string) {
  const panier = getPanier().filter((a) => a.produitId !== produitId);
  sauvegarderPanier(panier);
}

export function viderPanier() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLE_PANIER);
  window.dispatchEvent(new Event("panier-mis-a-jour"));
}

export function compterArticles(): number {
  const panier = getPanier();
  return panier.reduce((total, a) => total + a.quantite, 0);
}

/**
 * Calcule les totaux séparés par devise
 * Retourne { FC: number, USD: number }
 */
export function calculerTotauxParDevise(): { FC: number; USD: number } {
  const panier = getPanier();
  let totalFC = 0;
  let totalUSD = 0;

  panier.forEach((a) => {
    const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
    const montant = prixFinal * a.quantite;
    if (a.devise === "USD") {
      totalUSD += montant;
    } else {
      totalFC += montant;
    }
  });

  return { FC: totalFC, USD: totalUSD };
}

/**
 * Calcule les totaux originaux (avant réductions) par devise
 */
export function calculerTotauxOriginaux(): { FC: number; USD: number } {
  const panier = getPanier();
  let totalFC = 0;
  let totalUSD = 0;

  panier.forEach((a) => {
    const montant = a.prix * a.quantite;
    if (a.devise === "USD") {
      totalUSD += montant;
    } else {
      totalFC += montant;
    }
  });

  return { FC: totalFC, USD: totalUSD };
}

export function calculerTotal(): number {
  const { FC, USD } = calculerTotauxParDevise();
  return FC + USD;
}

export function formaterPrix(prix: number, devise: string): string {
  if (devise === "USD") {
    return `${prix.toFixed(2)} $`;
  }
  return `${prix.toLocaleString("fr-FR")} FC`;
}
