"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPanier,
  viderPanier,
  formaterPrix,
  grouperParBoutique,
  genererGroupeId,
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

  const acompteFC = Math.round(totalFC * 0.1);
  const acompteUSD = Math.round(totalUSD * 0.1 * 100) / 100;
  const resteFC = totalFC - acompteFC;
  const resteUSD = totalUSD - acompteUSD;

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

    // Détection multi-boutiques
    const groupes = grouperParBoutique(panier);

    if (groupes.length > 1) {
      // Redirection vers le flux multi-boutiques
      const groupeId = genererGroupeId();
      const params = new URLSearchParams({
        groupeId,
        nom: form.nom,
        telephone: form.telephone,
        adresse: form.adresse,
        mode: form.mode,
      });
      router.push(`/acheteur/commande/multi?${params.toString()}`);
      return;
    }

    // Flux normal (1 seule boutique)
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
          totalFC,
          totalUSD,
          devise: totalFC > 0 && totalUSD > 0 ? "MIXTE" : totalUSD > 0 ? "USD" : "FC",
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
      <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const champStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #E5E0D5",
    fontSize: "13px",
    marginBottom: "10px",
    fontFamily: "inherit",
    backgroundColor: "#FEFCF8",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "700" as const,
    fontSize: "11.5px",
    color: "#334155",
  };

  const logoBox = {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    backgroundColor: "white",
    border: "1px solid #E5E0D5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "3px",
    boxSizing: "border-box" as const,
    overflow: "hidden",
  };

  const logoImg = {
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
    border: "1px solid #E5E0D5",
    borderRadius: "8px",
    padding: "8px 10px",
    minWidth: 0,
  };

  const copierBtnStyle = (actif: boolean) => ({
    padding: "5px 9px",
    fontSize: "10.5px",
    backgroundColor: actif ? "#16a34a" : "#F1ECE0",
    color: actif ? "white" : "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "700" as const,
    flexShrink: 0,
    marginLeft: "6px",
  });

  return (
    <div style={{ padding: "16px 14px 20px 14px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <Link href="/acheteur/panier" style={{ color: "#1D4ED8", fontSize: "11px", fontWeight: "700" }}>
        ← Retour au panier
      </Link>

      <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "4px", marginTop: "12px" }}>
        Finaliser ma commande
      </h1>
      <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "11.5px", fontWeight: "600" }}>
        Remplissez vos informations.
      </p>

      {erreur && (
        <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "10px", borderRadius: "10px", marginBottom: "14px", fontSize: "11.5px", fontWeight: "600" }}>
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre}>
        <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px" }}>
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

        <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", marginTop: "14px" }}>
          Mode de réception
        </h2>

        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button
            type="button"
            onClick={() => changer("mode", "RETRAIT")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: form.mode === "RETRAIT" ? "2px solid #1D4ED8" : "1px solid #E5E0D5",
              backgroundColor: form.mode === "RETRAIT" ? "#EFF6FF" : "white",
              fontWeight: "700",
              fontSize: "12px",
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
              padding: "10px",
              borderRadius: "10px",
              border: form.mode === "LIVRAISON" ? "2px solid #1D4ED8" : "1px solid #E5E0D5",
              backgroundColor: form.mode === "LIVRAISON" ? "#EFF6FF" : "white",
              fontWeight: "700",
              fontSize: "12px",
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

        <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", marginTop: "14px" }}>
          Paiement de l&apos;acompte
        </h2>

        <div style={{
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "14px",
        }}>
          <p style={{ fontSize: "10.5px", fontWeight: "800", color: "#1E40AF", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Acompte à payer (10%)
          </p>

          {acompteUSD > 0 && (
            <p style={{ fontSize: "15px", fontWeight: "900", color: "#1E40AF", marginBottom: "2px" }}>
              {formaterPrix(acompteUSD, "USD")}
            </p>
          )}
          {acompteFC > 0 && (
            <p style={{ fontSize: "15px", fontWeight: "900", color: "#1E40AF", marginBottom: "8px" }}>
              {formaterPrix(acompteFC, "FC")}
            </p>
          )}

          <p style={{ fontSize: "10.5px", fontWeight: "800", color: "#1E40AF", marginBottom: "6px", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Reste à payer à la remise
          </p>

          {resteUSD > 0 && (
            <p style={{ fontSize: "13px", fontWeight: "800", color: "#1E3A5F", marginBottom: "2px" }}>
              {formaterPrix(resteUSD, "USD")}
            </p>
          )}
          {resteFC > 0 && (
            <p style={{ fontSize: "13px", fontWeight: "800", color: "#1E3A5F" }}>
              {formaterPrix(resteFC, "FC")}
            </p>
          )}

          <p style={{ fontSize: "10px", color: "#475569", marginTop: "10px", lineHeight: 1.4, fontWeight: "500" }}>
            Envoyez l&apos;acompte à <strong>{vendeur?.nomBoutique}</strong> via l&apos;un des numéros ci-dessous. Vous vous arrangerez avec le vendeur pour le taux de change si vous payez dans une autre devise.
          </p>

          {vendeur?.numMpesa && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center", marginTop: "10px" }}>
              <div style={logoBox}>
                <img src="https://i.ibb.co/NndcrT1d/m-pesa.jpg" alt="M-Pesa" style={logoImg} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "12.5px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vendeur.numMpesa}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numMpesa!, "mpesa")}
                  style={copierBtnStyle(copie === "mpesa")}
                >
                  {copie === "mpesa" ? "✅" : "📋"}
                </button>
              </div>
            </div>
          )}

          {vendeur?.numOrange && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
              <div style={logoBox}>
                <img src="https://i.ibb.co/pvr5LPxN/orange.jpg" alt="Orange" style={logoImg} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "12.5px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vendeur.numOrange}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numOrange!, "orange")}
                  style={copierBtnStyle(copie === "orange")}
                >
                  {copie === "orange" ? "✅" : "📋"}
                </button>
              </div>
            </div>
          )}

          {vendeur?.numAirtel && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
              <div style={logoBox}>
                <img src="https://i.ibb.co/spmBgLvg/airtel.jpg" alt="Airtel" style={logoImg} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "12.5px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {vendeur.numAirtel}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numAirtel!, "airtel")}
                  style={copierBtnStyle(copie === "airtel")}
                >
                  {copie === "airtel" ? "✅" : "📋"}
                </button>
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

        <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", marginTop: "14px" }}>
          Récapitulatif
        </h2>

        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "12px",
          border: "1px solid #E8DFC8",
          marginBottom: "14px",
        }}>
          {panier.map((a) => {
            const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
            return (
              <div key={a.produitId} style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
                fontSize: "11.5px",
              }}>
                <span style={{ color: "#334155", fontWeight: "600" }}>
                  {a.nom} × {a.quantite}
                </span>
                <span style={{ fontWeight: "700", color: "#0F172A" }}>
                  {formaterPrix(prixFinal * a.quantite, a.devise)}
                </span>
              </div>
            );
          })}

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "10px",
            borderTop: "1px solid #F1ECE0",
            marginTop: "8px",
          }}>
            <span style={{ fontWeight: "900", fontSize: "13px", color: "#0F172A" }}>TOTAL</span>
            <div style={{ textAlign: "right" }}>
              {totalUSD > 0 && (
                <p style={{ fontSize: "14px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                  {formaterPrix(totalUSD, "USD")}
                </p>
              )}
              {totalFC > 0 && (
                <p style={{ fontSize: "14px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                  {formaterPrix(totalFC, "FC")}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={envoi}
          style={{
            width: "100%",
            backgroundColor: "#1D4ED8",
            color: "white",
            padding: "13px",
            borderRadius: "12px",
            border: "none",
            fontWeight: "800",
            fontSize: "13px",
            cursor: "pointer",
            opacity: envoi ? 0.6 : 1,
          }}
        >
          {envoi ? "Envoi..." : "✅ Confirmer la commande"}
        </button>
      </form>
    </div>
  );
}
