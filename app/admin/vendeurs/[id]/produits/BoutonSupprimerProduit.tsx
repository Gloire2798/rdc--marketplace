"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        backgroundColor: "#dc2626",
        color: "white",
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
        opacity: chargement ? 0.6 : 1,
      }}
    >
      {chargement ? "Suppression..." : "🗑️ Supprimer"}
    </button>
  );
}
