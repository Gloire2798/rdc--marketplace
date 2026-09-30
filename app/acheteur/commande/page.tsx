"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPanier,
  viderPanier,
  formaterPrix,
  ArticlePanier,
} from "@/lib/panier";

interface InfosVendeur {
  id: string;
  nomBoutique: string;
  telephone: string;
  numMpesa: string | null;
  numOrange: string | null;
  numAirtel: string | null;
  numMobileMoney: string;
}

export default function PageCommande() {
  const router = useRouter();
  const [panier, setPanier] = useState<ArticlePanier[]>([]);
  const [vendeur, setVendeur] = useState<InfosVendeur | null>(null);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState<string | null>(null);

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    adresse: "",
    mode: "RETRAIT",
    reference: "",
  });

  useEffect(() => {
    const p = getPanier();
    setPanier(p);

    if (p.length === 0) {
      router.push("/acheteur/panier");
      return;
    }

    const vendeurId = p[0].vendeurId;
    fetch(`/api/vendeur/infos/${vendeurId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.succes) setVendeur(data.vendeur);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, [router]);

  const changer = (champ: string, valeur: string) => {
    setForm({ ...form, [champ]: valeur });
  };

  const copier = (texte: string, cle: string) => {
    navigator.clipboard.writeText(texte);
    setCopie(cle);
    setTimeout(() => setCopie(null), 2000);
  };

  const total = panier.reduce((acc, a) => {
    const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
    return acc + prixFinal * a.quantite;
  }, 0);

  const devise = panier[0]?.devise || "FC";
  const acompte = Math.round(total * 0.1);
  const reste = total - acompte;

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");

    if (!form.nom || !form.telephone) {
      setErreur("Nom et téléphone sont obligatoires");
      return;
    }

    if (form.mode === "LIVRAISON" && !form.adresse) {
      setErreur("L'adresse est obligatoire pour la livraison");
      return;
    }

    if (!form.reference) {
      setErreur("La référence de la transaction est obligatoire");
      return;
    }

    setEnvoi(true);

    try {
      const res = await fetch("/api/client/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendeurId: panier[0].vendeurId,
          nom: form.nom,
          telephone: form.telephone,
          adresse: form.adresse || null,
          mode: form.mode,
          reference: form.reference,
          articles: panier,
          total,
          acompte,
          reste,
          devise,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur lors de la commande");
        setEnvoi(false);
        return;
      }

      viderPanier();
      router.push(`/acheteur/commande/confirmation?commande=${data.commandeId}`);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setEnvoi(false);
    }
  };

  if (chargement) {
    return (
      <div className="container" style={{ padding: "60px 16px", textAlign: "center" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const champStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    marginBottom: "16px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600" as const,
    fontSize: "14px",
  };

  const logoBoxStyle = {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "4px",
    boxSizing: "border-box" as const,
    overflow: "hidden",
  };

  const logoImgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain" as const,
  };

  const numeroBoxStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px 12px",
    minWidth: 0,
  };

  const copierBtnStyle = (actif: boolean) => ({
    padding: "6px 10px",
    fontSize: "12px",
    backgroundColor: actif ? "#16a34a" : "#e5e7eb",
    color: actif ? "white" : "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    flexShrink: 0,
    marginLeft: "8px",
  });

  return (
    <div className="container" style={{ padding: "40px 16px", maxWidth: "600px" }}>
      <Link href="/acheteur/panier" style={{ color: "#2563eb", fontSize: "14px" }}>
        ← Retour au panier
      </Link>

      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", marginTop: "16px" }}>
        Finaliser ma commande
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "32px" }}>
        Remplissez vos informations pour valider la commande.
      </p>

      {erreur && (
        <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>
          Vos informations
        </h2>

        <label style={labelStyle}>Nom complet *</label>
        <input
          type="text"
          style={champStyle}
          value={form.nom}
          onChange={(e) => changer("nom", e.target.value)}
          required
        />

        <label style={labelStyle}>Numéro de téléphone *</label>
        <input
          type="tel"
          placeholder="0812345678"
          style={champStyle}
          value={form.telephone}
          onChange={(e) => changer("telephone", e.target.value)}
          required
        />

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", marginTop: "24px" }}>
          Mode de réception
        </h2>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <button
            type="button"
            onClick={() => changer("mode", "RETRAIT")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: form.mode === "RETRAIT" ? "2px solid #2563eb" : "1px solid #d1d5db",
              backgroundColor: form.mode === "RETRAIT" ? "#eff6ff" : "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🏪 Retrait
          </button>
          <button
            type="button"
            onClick={() => changer("mode", "LIVRAISON")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: form.mode === "LIVRAISON" ? "2px solid #2563eb" : "1px solid #d1d5db",
              backgroundColor: form.mode === "LIVRAISON" ? "#eff6ff" : "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🚚 Livraison
          </button>
        </div>

        {form.mode === "LIVRAISON" && (
          <>
            <label style={labelStyle}>Adresse de livraison *</label>
            <input
              type="text"
              placeholder="Ex: Avenue du Commerce, Gombe"
              style={champStyle}
              value={form.adresse}
              onChange={(e) => changer("adresse", e.target.value)}
              required
            />
          </>
        )}

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", marginTop: "24px" }}>
          Paiement de l'acompte
        </h2>

        <div style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
        }}>
          <p style={{ fontSize: "14px", marginBottom: "4px" }}>
            <strong>Acompte à payer :</strong> {formaterPrix(acompte, devise)} (10%)
          </p>
          <p style={{ fontSize: "14px", marginBottom: "12px" }}>
            <strong>Reste à payer à la remise :</strong> {formaterPrix(reste, devise)}
          </p>

          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            Envoyez l'acompte à <strong>{vendeur?.nomBoutique}</strong> via l'un des numéros ci-dessous :
          </p>

          {vendeur?.numMpesa && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <div style={logoBoxStyle}>
                <img src="https://i.ibb.co/NndcrT1d/m-pesa.jpg" alt="M-Pesa" style={logoImgStyle} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "14px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vendeur.numMpesa}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numMpesa!, "mpesa")}
                  style={copierBtnStyle(copie === "mpesa")}
                >
                  {copie === "mpesa" ? "✅ Copié" : "📋 Copier"}
                </button>
              </div>
            </div>
          )}

          {vendeur?.numOrange && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <div style={logoBoxStyle}>
                <img src="https://i.ibb.co/pvr5LPxN/orange.jpg" alt="Orange" style={logoImgStyle} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "14px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vendeur.numOrange}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numOrange!, "orange")}
                  style={copierBtnStyle(copie === "orange")}
                >
                  {copie === "orange" ? "✅ Copié" : "📋 Copier"}
                </button>
              </div>
            </div>
          )}

          {vendeur?.numAirtel && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
              <div style={logoBoxStyle}>
                <img src="https://i.ibb.co/spmBgLvg/airtel.jpg" alt="Airtel" style={logoImgStyle} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "14px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vendeur.numAirtel}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numAirtel!, "airtel")}
                  style={copierBtnStyle(copie === "airtel")}
                >
                  {copie === "airtel" ? "✅ Copié" : "📋 Copier"}
                </button>
              </div>
            </div>
          )}

          {!vendeur?.numMpesa && !vendeur?.numOrange && !vendeur?.numAirtel && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>
                  {vendeur?.numMobileMoney || "Numéro non renseigné"}
                </span>
                {vendeur?.numMobileMoney && (
                  <button
                    type="button"
                    onClick={() => copier(vendeur.numMobileMoney, "general")}
                    style={copierBtnStyle(copie === "general")}
                  >
                    {copie === "general" ? "✅ Copié" : "📋 Copier"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <label style={labelStyle}>Référence de la transaction *</label>
        <input
          type="text"
          placeholder="Ex: MP250927.1432.A78432"
          style={champStyle}
          value={form.reference}
          onChange={(e) => changer("reference", e.target.value)}
          required
        />

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", marginTop: "24px" }}>
          Récapitulatif
        </h2>

        <div className="card" style={{ marginBottom: "24px" }}>
          {panier.map((a) => {
            const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
            return (
              <div key={a.produitId} style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "14px",
              }}>
                <span>{a.nom} × {a.quantite}</span>
                <span>{formaterPrix(prixFinal * a.quantite, a.devise)}</span>
              </div>
            );
          })}

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid #e5e7eb",
            marginTop: "12px",
            fontWeight: "bold",
            fontSize: "16px",
          }}>
            <span>TOTAL</span>
            <span style={{ color: "#2563eb" }}>{formaterPrix(total, devise)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={envoi}
          className="btn btn-primary"
          style={{ width: "100%", opacity: envoi ? 0.6 : 1 }}
        >
          {envoi ? "Envoi..." : "✅ Confirmer la commande"}
        </button>
      </form>
    </div>
  );
          }
