"use client";

import { useState, useMemo } from "react";
import { ajouterAuPanier } from "@/lib/panier";
import { ShoppingCart, Check, AlertCircle } from "lucide-react";

interface Article {
  produitId: string;
  vendeurId: string;
  nom: string;
  prix: number;
  prixPromo: number | null;
  devise: string;
  photo: string | null;
  nomBoutique: string;
}

interface Variante {
  id: string;
  attributs: Record<string, string>;
  stock: number;
  prix: number | null;
  prixPromo: number | null;
}

interface Props {
  article: Article;
  variantes: Variante[];
  devise: string;
  prixBase: number;
  prixPromoBase: number | null;
  stockSimple?: number;
}

export default function SelecteurVariantes({
  article,
  variantes,
  devise,
  prixBase,
  prixPromoBase,
  stockSimple,
}: Props) {
  const aVariantes = variantes.length > 0;

  const [selection, setSelection] = useState<Record<string, string>>({});
  const [ajoute, setAjoute] = useState(false);
  const [erreur, setErreur] = useState("");

  const listeAttributs = useMemo(() => {
    if (!aVariantes) return [];
    const map = new Map<string, Set<string>>();
    variantes.forEach((v) => {
      Object.entries(v.attributs).forEach(([attr, val]) => {
        if (!map.has(attr)) map.set(attr, new Set());
        map.get(attr)!.add(val);
      });
    });
    return Array.from(map.entries()).map(([nom, valeurs]) => ({
      nom,
      valeurs: Array.from(valeurs),
    }));
  }, [variantes, aVariantes]);

  const varianteChoisie = useMemo(() => {
    if (!aVariantes) return null;
    const nbAttributs = listeAttributs.length;
    if (Object.keys(selection).length !== nbAttributs) return null;

    return (
      variantes.find((v) => {
        return listeAttributs.every(
          (attr) => v.attributs[attr.nom] === selection[attr.nom]
        );
      }) || null
    );
  }, [selection, variantes, listeAttributs, aVariantes]);

  const valeurDisponible = (attributNom: string, valeur: string): boolean => {
    return variantes.some((v) => {
      if (v.attributs[attributNom] !== valeur) return false;
      if (v.stock <= 0) return false;

      for (const [autreAttr, autreVal] of Object.entries(selection)) {
        if (autreAttr === attributNom) continue;
        if (v.attributs[autreAttr] !== autreVal) return false;
      }
      return true;
    });
  };

  const stockActuel = aVariantes
    ? varianteChoisie?.stock ?? 0
    : stockSimple ?? 0;

  const toutSelectionne = aVariantes
    ? Object.keys(selection).length === listeAttributs.length
    : true;

  const enRupture = toutSelectionne && stockActuel === 0;
  const nonSelectionne = aVariantes && !toutSelectionne;

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") return `${prix.toFixed(2)} $`;
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const ajouter = () => {
    setErreur("");

    if (nonSelectionne) {
      setErreur("Veuillez choisir toutes les options");
      return;
    }

    if (stockActuel === 0) {
      setErreur("Rupture de stock pour cette combinaison");
      return;
    }

    try {
      const articleAvecVariante = {
        ...article,
        varianteId: varianteChoisie?.id || null,
        varianteInfo: varianteChoisie?.attributs || null,
      };

      ajouterAuPanier(articleAvecVariante as any);
      setAjoute(true);
      setTimeout(() => setAjoute(false), 2000);
    } catch {
      setErreur("Erreur lors de l'ajout");
    }
  };

  return (
    <div>
      {aVariantes && (
        <div style={{ marginBottom: "14px" }}>
          {listeAttributs.map((attr) => (
            <div key={attr.nom} style={{ marginBottom: "12px" }}>
              <p style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#334155",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}>
                {attr.nom}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {attr.valeurs.map((valeur) => {
                  const actif = selection[attr.nom] === valeur;
                  const dispo = valeurDisponible(attr.nom, valeur);

                  return (
                    <button
                      key={valeur}
                      onClick={() => {
                        if (!dispo) return;
                        setSelection((prev) => ({ ...prev, [attr.nom]: valeur }));
                      }}
                      disabled={!dispo}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: "700",
                        border: actif
                          ? "2px solid #1D4ED8"
                          : "1px solid #E5E0D5",
                        backgroundColor: actif
                          ? "#EFF6FF"
                          : dispo
                          ? "white"
                          : "#F8FAFC",
                        color: actif
                          ? "#1D4ED8"
                          : dispo
                          ? "#0F172A"
                          : "#CBD5E1",
                        cursor: dispo ? "pointer" : "not-allowed",
                        textDecoration: dispo ? "none" : "line-through",
                        opacity: dispo ? 1 : 0.6,
                        position: "relative",
                      }}
                    >
                      {valeur}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{
        fontSize: "11px",
        color: nonSelectionne ? "#64748b" : enRupture ? "#dc2626" : "#16a34a",
        fontWeight: "700",
        marginBottom: "12px",
      }}>
        {nonSelectionne
          ? "👆 Choisissez les options"
          : enRupture
          ? "❌ Rupture de stock"
          : `✅ En stock (${stockActuel})`}
      </p>

      <button
        onClick={ajouter}
        disabled={enRupture || nonSelectionne}
        style={{
          width: "100%",
          backgroundColor: enRupture
            ? "#9ca3af"
            : nonSelectionne
            ? "#94a3b8"
            : ajoute
            ? "#16a34a"
            : "#1D4ED8",
          color: "white",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "none",
          fontWeight: "800",
          fontSize: "13px",
          cursor: enRupture || nonSelectionne ? "not-allowed" : "pointer",
          transition: "background-color 0.3s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        {nonSelectionne ? (
          "Choisissez les options"
        ) : enRupture ? (
          "❌ Rupture de stock"
        ) : ajoute ? (
          <>
            <Check size={16} strokeWidth={3} />
            Ajouté au panier !
          </>
        ) : (
          <>
            <ShoppingCart size={16} strokeWidth={2.8} />
            Ajouter au panier
          </>
        )}
      </button>

      {erreur && (
        <p style={{
          color: "#dc2626",
          fontSize: "11px",
          marginTop: "6px",
          textAlign: "center",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}>
          <AlertCircle size={12} />
          {erreur}
        </p>
      )}
    </div>
  );
      }
