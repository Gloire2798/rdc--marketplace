"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPanier,
  viderPanier,
  formaterPrix,
  formaterVariante,
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

    const groupes = grouperParBoutique(p);

    if (groupes.length > 1) {
      const groupeId = genererGroupeId();
      router.push(`/acheteur/commande/multi?groupeId=${groupeId}`);
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
      <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
        <p style={{ color: "#57534E", fontWeight: "700" }}>Chargement...</p>
      </div>
    );
  }

  const champStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1.5px solid #0F172A",
    fontSize: "13px",
    marginBottom: "12px",
    fontFamily: "inherit",
    backgroundColor: "white",
    fontWeight: "700" as const,
    color: "#0F172A",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "800" as const,
    fontSize: "11px",
    color: "#0F172A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.4px",
  };

  const logoBox = {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    backgroundColor: "white",
    border: "1.5px solid #0F172A",
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
    border: "1.5px solid #0F172A",
    borderRadius: "12px",
    padding: "8px 10px",
    minWidth: 0,
  };

  const copierBtnStyle = (actif: boolean) => ({
    padding: "5px 10px",
    fontSize: "11px",
    backgroundColor: actif ? "#16A34A" : "#0F172A",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "800" as const,
    flexShrink: 0,
    marginLeft: "6px",
  });

  const titreSection = {
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    marginBottom: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  };

  const traitOrange = {
    display: "inline-block",
    width: "3px",
    height: "14px",
    backgroundColor: "#EA580C",
    borderRadius: "2px",
  };  return (
    <div style={{ padding: "16px 14px 30px 14px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <Link href="/acheteur/panier" style={{
        color: "#0F172A",
        fontSize: "11.5px",
        fontWeight: "800",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}>
        ← Retour au panier
      </Link>

      <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0F172A", marginBottom: "4px", marginTop: "12px", letterSpacing: "-0.5px" }}>
        Finaliser ma commande
      </h1>
      <p style={{ color: "#57534E", marginBottom: "20px", fontSize: "12px", fontWeight: "700" }}>
        Remplissez vos informations.
      </p>

      {erreur && (
        <div style={{
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          padding: "12px",
          borderRadius: "14px",
          marginBottom: "14px",
          fontSize: "11.5px",
          fontWeight: "700",
          border: "1.5px solid #DC2626",
        }}>
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre}>
        <h2 style={titreSection}>
          <span style={traitOrange} />
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

        <h2 style={{ ...titreSection, marginTop: "16px" }}>
          <span style={traitOrange} />
          Mode de réception
        </h2>

        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button
            type="button"
            onClick={() => changer("mode", "RETRAIT")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              border: form.mode === "RETRAIT" ? "2px solid #0F172A" : "1.5px solid #D4C5A0",
              backgroundColor: form.mode === "RETRAIT" ? "#0F172A" : "white",
              color: form.mode === "RETRAIT" ? "white" : "#0F172A",
              fontWeight: "900",
              fontSize: "12.5px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Retrait
          </button>
          <button
            type="button"
            onClick={() => changer("mode", "LIVRAISON")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              border: form.mode === "LIVRAISON" ? "2px solid #0F172A" : "1.5px solid #D4C5A0",
              backgroundColor: form.mode === "LIVRAISON" ? "#0F172A" : "white",
              color: form.mode === "LIVRAISON" ? "white" : "#0F172A",
              fontWeight: "900",
              fontSize: "12.5px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Livraison
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

        <h2 style={{ ...titreSection, marginTop: "16px" }}>
          <span style={traitOrange} />
          Paiement de l&apos;acompte
        </h2>

        <div style={{
          backgroundColor: "white",
          border: "1.5px solid #0F172A",
          borderRadius: "20px",
          padding: "14px",
          marginBottom: "14px",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <p style={{
            fontSize: "10.5px",
            fontWeight: "900",
            color: "#57534E",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            Acompte à payer (10%)
          </p>

          {acompteUSD > 0 && (
            <p style={{ fontSize: "20px", fontWeight: "900", color: "#EA580C", marginBottom: "2px", letterSpacing: "-0.3px" }}>
              {formaterPrix(acompteUSD, "USD")}
            </p>
          )}
          {acompteFC > 0 && (
            <p style={{ fontSize: "20px", fontWeight: "900", color: "#EA580C", marginBottom: "8px", letterSpacing: "-0.3px" }}>
              {formaterPrix(acompteFC, "FC")}
            </p>
          )}

          <div style={{
            borderTop: "1px dashed #D4C5A0",
            paddingTop: "10px",
            marginTop: "8px",
          }}>
            <p style={{
              fontSize: "10.5px",
              fontWeight: "900",
              color: "#57534E",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Reste à payer à la remise
            </p>

            {resteUSD > 0 && (
              <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A", marginBottom: "2px" }}>
                {formaterPrix(resteUSD, "USD")}
              </p>
            )}
            {resteFC > 0 && (
              <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A" }}>
                {formaterPrix(resteFC, "FC")}
              </p>
            )}
          </div>

          <p style={{ fontSize: "11px", color: "#57534E", marginTop: "12px", lineHeight: 1.5, fontWeight: "600" }}>
            Envoyez l&apos;acompte à <strong style={{ color: "#0F172A" }}>{vendeur?.nomBoutique}</strong> via l&apos;un des numéros ci-dessous.
          </p>

          {vendeur?.numMpesa && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", alignItems: "center", marginTop: "12px" }}>
              <div style={logoBox}>
                <img src="https://i.ibb.co/NndcrT1d/m-pesa.jpg" alt="M-Pesa" style={logoImg} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "13px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis", color: "#0F172A" }}>
                  {vendeur.numMpesa}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numMpesa!, "mpesa")}
                  style={copierBtnStyle(copie === "mpesa")}
                >
                  {copie === "mpesa" ? "Copié" : "Copier"}
                </button>
              </div>
            </div>
          )}

          {vendeur?.numOrange && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", alignItems: "center" }}>
              <div style={logoBox}>
                <img src="https://i.ibb.co/pvr5LPxN/orange.jpg" alt="Orange" style={logoImg} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "13px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis", color: "#0F172A" }}>
                  {vendeur.numOrange}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numOrange!, "orange")}
                  style={copierBtnStyle(copie === "orange")}
                >
                  {copie === "orange" ? "Copié" : "Copier"}
                </button>
              </div>
            </div>
          )}

          {vendeur?.numAirtel && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", alignItems: "center" }}>
              <div style={logoBox}>
                <img src="https://i.ibb.co/spmBgLvg/airtel.jpg" alt="Airtel" style={logoImg} />
              </div>
              <div style={numeroBoxStyle}>
                <span style={{ fontSize: "13px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis", color: "#0F172A" }}>
                  {vendeur.numAirtel}
                </span>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numAirtel!, "airtel")}
                  style={copierBtnStyle(copie === "airtel")}
                >
                  {copie === "airtel" ? "Copié" : "Copier"}
                </button>
              </div>
            </div>
          )}

          {!vendeur?.numMpesa && !vendeur?.numOrange && !vendeur?.numAirtel && vendeur?.numMobileMoney && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", alignItems: "center", marginTop: "12px" }}>
              <div style={logoBox}>
                <span style={{ fontSize: "18px" }}>📱</span>
              </div>
              <div style={numeroBoxStyle}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "9px", color: "#57534E", fontWeight: "800", textTransform: "uppercase" }}>
                    Mobile Money
                  </p>
                  <span style={{ fontSize: "13px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis", display: "block", color: "#0F172A" }}>
                    {vendeur.numMobileMoney}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copier(vendeur.numMobileMoney!, "mobile")}
                  style={copierBtnStyle(copie === "mobile")}
                >
                  {copie === "mobile" ? "Copié" : "Copier"}
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

        <h2 style={{ ...titreSection, marginTop: "16px" }}>
          <span style={traitOrange} />
          Récapitulatif
        </h2>

        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "14px",
          border: "1.5px solid #0F172A",
          marginBottom: "16px",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          {panier.map((a) => {
            const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
            const cleLigne = `${a.produitId}::${a.varianteId || "sv"}`;
            const labelVariante = formaterVariante(a.varianteInfo);

            return (
              <div key={cleLigne} style={{
                marginBottom: "10px",
                paddingBottom: "10px",
                borderBottom: "1px dashed #D4C5A0",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}>
                  <span style={{ color: "#0F172A", fontWeight: "800" }}>
                    {a.nom} × {a.quantite}
                  </span>
                  <span style={{ fontWeight: "900", color: "#0F172A" }}>
                    {formaterPrix(prixFinal * a.quantite, a.devise)}
                  </span>
                </div>
                {labelVariante && (
                  <p style={{
                    fontSize: "10px",
                    color: "#0F172A",
                    fontWeight: "800",
                    backgroundColor: "#F5EAD2",
                    border: "1px solid #D4C5A0",
                    display: "inline-block",
                    padding: "2px 7px",
                    borderRadius: "8px",
                    marginTop: "4px",
                  }}>
                    {labelVariante}
                  </p>
                )}
              </div>
            );
          })}

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "8px",
          }}>
            <span style={{ fontWeight: "900", fontSize: "13px", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total
            </span>
            <div style={{ textAlign: "right" }}>
              {totalUSD > 0 && (
                <p style={{ fontSize: "17px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                  {formaterPrix(totalUSD, "USD")}
                </p>
              )}
              {totalFC > 0 && (
                <p style={{ fontSize: "17px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
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
            backgroundColor: "#0F172A",
            color: "white",
            padding: "16px",
            borderRadius: "26px",
            border: "none",
            fontWeight: "900",
            fontSize: "14px",
            cursor: "pointer",
            opacity: envoi ? 0.6 : 1,
            letterSpacing: "-0.2px",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
            fontFamily: "inherit",
          }}
        >
          {envoi ? "Envoi..." : "Confirmer la commande"}
        </button>
      </form>
    </div>
  );
                      }
