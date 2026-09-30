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

/**
 * Récupère le panier depuis localStorage
 */
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

/**
 * Sauvegarde le panier dans localStorage
 */
export function sauvegarderPanier(panier: ArticlePanier[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
  // Notifier les autres composants
  window.dispatchEvent(new Event("panier-mis-a-jour"));
}

/**
 * Ajoute un produit au panier
 */
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

/**
 * Change la quantité d'un article
 */
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

/**
 * Retire un article du panier
 */
export function retirerDuPanier(produitId: string) {
  const panier = getPanier().filter((a) => a.produitId !== produitId);
  sauvegarderPanier(panier);
}

/**
 * Vide le panier
 */
export function viderPanier() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLE_PANIER);
  window.dispatchEvent(new Event("panier-mis-a-jour"));
}

/**
 * Compte le nombre total d'articles
 */
export function compterArticles(): number {
  const panier = getPanier();
  return panier.reduce((total, a) => total + a.quantite, 0);
}

/**
 * Calcule le total du panier
 */
export function calculerTotal(): number {
  const panier = getPanier();
  return panier.reduce((total, a) => {
    const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
    return total + prixFinal * a.quantite;
  }, 0);
}

/**
 * Formate un prix selon la devise
 */
export function formaterPrix(prix: number, devise: string): string {
  if (devise === "USD") {
    return `${prix.toFixed(2)} $`;
  }
  return `${prix.toLocaleString("fr-FR")} FC`;
}
