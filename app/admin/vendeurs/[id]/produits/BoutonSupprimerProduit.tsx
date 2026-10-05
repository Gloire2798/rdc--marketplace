"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function BoutonSupprimerProduit({
  produitId,
  nomProduit,
}: {
  produitId: string;
  nomProduit: string;
}) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  const supprimer = async () => {
    const confirmer = confirm(
      `Supprimer définitivement le produit "${nomProduit}" ?\n\nCette action est irréversible.`
    );

    if (!confirmer) return;

    setChargement(true);

    try {
      const res = await fetch(`/api/admin/produits/${produitId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    }

    setChargement(false);
  };

  return (
    <button
      onClick={supprimer}
      disabled={chargement}
      style={{
        width: "100%",
        backgroundColor: "white",
        color: "#DC2626",
        padding: "10px 14px",
        borderRadius: "20px",
        border: "1.5px solid #DC2626",
        fontWeight: "900",
        fontSize: "11.5px",
        cursor: chargement ? "not-allowed" : "pointer",
        opacity: chargement ? 0.6 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        fontFamily: "inherit",
      }}
    >
      <Trash2 size={13} strokeWidth={2.8} />
      {chargement ? "Suppression..." : "Supprimer"}
    </button>
  );
}
