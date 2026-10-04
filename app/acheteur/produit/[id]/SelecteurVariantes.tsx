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
      {/* ATTRIBUTS */}
      {aVariantes && (
        <div style={{ marginBottom: "18px" }}>
          {listeAttributs.map((attr) => (
            <div key={attr.nom} style={{ marginBottom: "14px" }}>
              <p style={{
                fontSize: "12px",
                fontWeight: "900",
                color: "#334155",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                textAlign: "center",
              }}>
                {attr.nom}
              </p>
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}>
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
                        minWidth: "90px",
                        padding: "8px 18px",
                        borderRadius: "22px",
                        fontSize: "13px",
                        fontWeight: "800",
                        border: "2px solid #0F172A",
                        backgroundColor: actif ? "#0F172A" : "white",
                        color: actif ? "white" : "#0F172A",
                        cursor: dispo ? "pointer" : "not-allowed",
                        textDecoration: dispo ? "none" : "line-through",
                        opacity: dispo ? 1 : 0.4,
                        boxShadow: actif ? "3px 3px 0 #EA580C" : "none",
                        transition: "all 0.15s ease",
                        fontFamily: "inherit",
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

      {/* STATUT STOCK */}
      <p style={{
        fontSize: "11.5px",
        color: nonSelectionne ? "#64748B" : enRupture ? "#DC2626" : "#16A34A",
        fontWeight: "800",
        marginBottom: "14px",
        textAlign: "center",
      }}>
        {nonSelectionne
          ? "Choisissez les options ci-dessus"
          : enRupture
          ? "Rupture de stock pour cette combinaison"
          : `En stock (${stockActuel} disponible${stockActuel > 1 ? "s" : ""})`}
      </p>

      {/* BOUTON AJOUTER */}
      <button
        onClick={ajouter}
        disabled={enRupture || nonSelectionne}
        style={{
          width: "100%",
          backgroundColor:
            enRupture || nonSelectionne
              ? "#94A3B8"
              : ajoute
              ? "#16A34A"
              : "#0F172A",
          color: "white",
          padding: "16px 20px",
          borderRadius: "26px",
          border: "none",
          fontWeight: "900",
          fontSize: "15px",
          cursor: enRupture || nonSelectionne ? "not-allowed" : "pointer",
          transition: "background-color 0.25s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          letterSpacing: "-0.2px",
          fontFamily: "inherit",
        }}
      >
        {nonSelectionne ? (
          "Choisissez les options"
        ) : enRupture ? (
          "Rupture de stock"
        ) : ajoute ? (
          <>
            <Check size={18} strokeWidth={3} />
            Ajouté au panier
          </>
        ) : (
          <>
            <ShoppingCart size={18} strokeWidth={2.8} />
            Ajouter au panier
          </>
        )}
      </button>

      {/* ERREUR */}
      {erreur && (
        <p style={{
          color: "#DC2626",
          fontSize: "11px",
          marginTop: "10px",
          textAlign: "center",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}>
          <AlertCircle size={13} />
          {erreur}
        </p>
      )}
    </div>
  );
              }
