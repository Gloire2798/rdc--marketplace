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
  // Support des variantes
  varianteId?: string | null;
  varianteInfo?: Record<string, string> | null;
}

const CLE_PANIER = "gk_sensei_panier";

// Clé unique d'un article dans le panier
// = produitId + varianteId (si existe)
// → 2 variantes du même produit = 2 lignes différentes
function cleArticle(a: { produitId: string; varianteId?: string | null }): string {
  return `${a.produitId}::${a.varianteId || "sans-variante"}`;
}

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
  const cle = cleArticle(article);

  const existant = panier.find((a) => cleArticle(a) === cle);

  if (existant) {
    existant.quantite += 1;
  } else {
    panier.push({
      ...article,
      varianteId: article.varianteId || null,
      varianteInfo: article.varianteInfo || null,
      quantite: 1,
    });
  }

  sauvegarderPanier(panier);
}

export function changerQuantite(produitId: string, quantite: number, varianteId?: string | null) {
  const panier = getPanier();
  const cle = `${produitId}::${varianteId || "sans-variante"}`;
  const article = panier.find((a) => cleArticle(a) === cle);

  if (article) {
    if (quantite <= 0) {
      retirerDuPanier(produitId, varianteId);
      return;
    }
    article.quantite = quantite;
    sauvegarderPanier(panier);
  }
}

export function retirerDuPanier(produitId: string, varianteId?: string | null) {
  const cle = `${produitId}::${varianteId || "sans-variante"}`;
  const panier = getPanier().filter((a) => cleArticle(a) !== cle);
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

export function genererGroupeId(): string {
  return `GRP_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export interface GroupeBoutique {
  vendeurId: string;
  nomBoutique: string;
  articles: ArticlePanier[];
  totalFC: number;
  totalUSD: number;
  acompteFC: number;
  acompteUSD: number;
}

export function grouperParBoutique(panier: ArticlePanier[]): GroupeBoutique[] {
  const groupes = new Map<string, GroupeBoutique>();

  panier.forEach((article) => {
    if (!groupes.has(article.vendeurId)) {
      groupes.set(article.vendeurId, {
        vendeurId: article.vendeurId,
        nomBoutique: article.nomBoutique,
        articles: [],
        totalFC: 0,
        totalUSD: 0,
        acompteFC: 0,
        acompteUSD: 0,
      });
    }

    const groupe = groupes.get(article.vendeurId)!;
    const prixFinal = article.prixPromo !== null ? article.prixPromo : article.prix;
    const montant = prixFinal * article.quantite;

    groupe.articles.push(article);

    if (article.devise === "USD") {
      groupe.totalUSD += montant;
    } else {
      groupe.totalFC += montant;
    }
  });

  const resultat = Array.from(groupes.values());
  resultat.forEach((g) => {
    g.acompteFC = Math.round(g.totalFC * 0.1);
    g.acompteUSD = Math.round(g.totalUSD * 0.1 * 100) / 100;
  });

  return resultat;
}

// Afficher le libellé d'une variante (ex: "Noir · M")
export function formaterVariante(varianteInfo?: Record<string, string> | null): string {
  if (!varianteInfo) return "";
  return Object.entries(varianteInfo)
    .map(([k, v]) => `${v}`)
    .join(" · ");
  }
