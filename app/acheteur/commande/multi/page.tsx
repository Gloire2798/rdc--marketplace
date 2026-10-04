"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getPanier,
  viderPanier,
  formaterPrix,
  formaterVariante,
  grouperParBoutique,
  GroupeBoutique,
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

function ContenuMulti() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const groupeId = searchParams.get("groupeId") || "";

  const [panier, setPanier] = useState<ArticlePanier[]>([]);
  const [groupes, setGroupes] = useState<GroupeBoutique[]>([]);
  const [indexActuel, setIndexActuel] = useState(0);
  const [vendeur, setVendeur] = useState<InfosVendeur | null>(null);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState<string | null>(null);
  const [commandesCreees, setCommandesCreees] = useState<string[]>([]);

  const [infos, setInfos] = useState({
    nom: "",
    telephone: "",
    adresse: "",
    mode: "RETRAIT",
  });

  const [reference, setReference] = useState("");

  useEffect(() => {
    const p = getPanier();
    if (p.length === 0) {
      router.push("/acheteur/panier");
      return;
    }
    setPanier(p);

    const g = grouperParBoutique(p);
    setGroupes(g);

    if (g.length === 0) {
      router.push("/acheteur/panier");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (groupes.length === 0 || indexActuel >= groupes.length) return;

    setChargement(true);
    setVendeur(null);

    const vendeurId = groupes[indexActuel].vendeurId;

    fetch(`/api/vendeur/infos/${vendeurId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.succes) setVendeur(data.vendeur);
        setChargement(false);
      })
      .catch(() => setChargement(false));

    setReference("");
  }, [indexActuel, groupes]);

  const copier = (texte: string, cle: string) => {
    navigator.clipboard.writeText(texte);
    setCopie(cle);
    setTimeout(() => setCopie(null), 2000);
  };

  const groupeActuel = groupes[indexActuel];
  const estDernier = indexActuel === groupes.length - 1;

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");

    if (indexActuel === 0) {
      if (!infos.nom || !infos.telephone) {
        setErreur("Nom et téléphone sont obligatoires");
        return;
      }
      if (infos.mode === "LIVRAISON" && !infos.adresse) {
        setErreur("L'adresse est obligatoire pour la livraison");
        return;
      }
    }

    if (!reference) {
      setErreur("La référence de la transaction est obligatoire");
      return;
    }

    setEnvoi(true);

    try {
      const res = await fetch("/api/client/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendeurId: groupeActuel.vendeurId,
          nom: infos.nom,
          telephone: infos.telephone,
          adresse: infos.adresse || null,
          mode: infos.mode,
          reference,
          articles: groupeActuel.articles,
          totalFC: groupeActuel.totalFC,
          totalUSD: groupeActuel.totalUSD,
          devise:
            groupeActuel.totalFC > 0 && groupeActuel.totalUSD > 0
              ? "MIXTE"
              : groupeActuel.totalUSD > 0
              ? "USD"
              : "FC",
          groupeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur lors de la commande");
        setEnvoi(false);
        return;
      }

      const nouvellesCommandes = [...commandesCreees, data.commandeId];
      setCommandesCreees(nouvellesCommandes);

      if (estDernier) {
        viderPanier();
        router.push(
          `/acheteur/commande/confirmation?groupe=${groupeId}&commandes=${nouvellesCommandes.join(",")}`
        );
        return;
      }

      setIndexActuel(indexActuel + 1);
      setEnvoi(false);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setEnvoi(false);
    }
  };

  if (chargement || groupes.length === 0) {
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

  const aucunNumeroSpecifique =
    !vendeur?.numMpesa && !vendeur?.numOrange && !vendeur?.numAirtel;

  return (
    <div style={{ padding: "16px 14px 20px 14px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
      <Link href="/acheteur/panier" style={{ color: "#1D4ED8", fontSize: "11px", fontWeight: "700" }}>
        ← Retour au panier
      </Link>

      <div style={{
        display: "flex",
        gap: "6px",
        marginTop: "14px",
        marginBottom: "10px",
        justifyContent: "center",
      }}>
        {groupes.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "5px",
              borderRadius: "3px",
              backgroundColor: i <= indexActuel ? "#1D4ED8" : "#E5E0D5",
            }}
          />
        ))}
      </div>

      <p style={{
        textAlign: "center",
        fontSize: "11.5px",
        fontWeight: "800",
        color: "#1D4ED8",
        marginBottom: "12px",
      }}>
        Commande {indexActuel + 1} sur {groupes.length}
      </p>

      <h1 style={{ fontSize: "19px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
        🏪 {groupeActuel.nomBoutique}
      </h1>
      <p style={{ color: "#64748b", marginBottom: "18px", fontSize: "11.5px", fontWeight: "600" }}>
        {groupeActuel.articles.length} article{groupeActuel.articles.length > 1 ? "s" : ""} chez cette boutique
      </p>

      {groupes.length > 1 && indexActuel === 0 && (
        <div style={{
          backgroundColor: "#FEF3C7",
          color: "#78350F",
          padding: "10px 12px",
          borderRadius: "10px",
          marginBottom: "14px",
          border: "1px solid #FDE68A",
        }}>
          <p style={{ fontWeight: "800", fontSize: "11.5px", marginBottom: "3px" }}>
            ℹ️ Votre panier contient {groupes.length} boutiques
          </p>
          <p style={{ fontSize: "10.5px", fontWeight: "500", lineHeight: 1.4 }}>
            Nous allons passer vos commandes une par une. Vos infos seront conservées d&apos;une boutique à l&apos;autre.
          </p>
        </div>
      )}

      {erreur && (
        <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "10px", borderRadius: "10px", marginBottom: "14px", fontSize: "11.5px", fontWeight: "600" }}>
          {erreur}
        </div>
      )}

      <form onSubmit={soumettre}>
        {indexActuel === 0 && (
          <>
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px" }}>
              Vos informations
            </h2>

            <label style={labelStyle}>Nom complet *</label>
            <input
              type="text"
              style={champStyle}
              value={infos.nom}
              onChange={(e) => setInfos({ ...infos, nom: e.target.value })}
              required
            />

            <label style={labelStyle}>Numéro de téléphone *</label>
            <input
              type="tel"
              placeholder="0812345678"
              style={champStyle}
              value={infos.telephone}
              onChange={(e) => setInfos({ ...infos, telephone: e.target.value })}
              required
            />

            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", marginTop: "14px" }}>
              Mode de réception
            </h2>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setInfos({ ...infos, mode: "RETRAIT" })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: infos.mode === "RETRAIT" ? "2px solid #1D4ED8" : "1px solid #E5E0D5",
                  backgroundColor: infos.mode === "RETRAIT" ? "#EFF6FF" : "white",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🏪 Retrait
              </button>
              <button
                type="button"
                onClick={() => setInfos({ ...infos, mode: "LIVRAISON" })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: infos.mode === "LIVRAISON" ? "2px solid #1D4ED8" : "1px solid #E5E0D5",
                  backgroundColor: infos.mode === "LIVRAISON" ? "#EFF6FF" : "white",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🚚 Livraison
              </button>
            </div>

            {infos.mode === "LIVRAISON" && (
              <>
                <label style={labelStyle}>Adresse de livraison *</label>
                <input
                  type="text"
                  placeholder="Ex: Avenue du Commerce, Gombe"
                  style={champStyle}
                  value={infos.adresse}
                  onChange={(e) => setInfos({ ...infos, adresse: e.target.value })}
                  required
                />
              </>
            )}
          </>
        )}

        {indexActuel > 0 && (
          <div style={{
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "10px",
            padding: "10px 12px",
            marginBottom: "14px",
          }}>
            <p style={{ fontSize: "10.5px", fontWeight: "800", color: "#1E40AF", marginBottom: "4px" }}>
              👤 {infos.nom} · 📞 {infos.telephone}
            </p>
            <p style={{ fontSize: "10px", color: "#475569", fontWeight: "500" }}>
              Vos infos sont conservées. Il ne reste que la référence de paiement à saisir.
            </p>
          </div>
        )}        <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", marginTop: "14px" }}>
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

          {groupeActuel.acompteUSD > 0 && (
            <p style={{ fontSize: "15px", fontWeight: "900", color: "#1E40AF", marginBottom: "2px" }}>
              {formaterPrix(groupeActuel.acompteUSD, "USD")}
            </p>
          )}
          {groupeActuel.acompteFC > 0 && (
            <p style={{ fontSize: "15px", fontWeight: "900", color: "#1E40AF", marginBottom: "8px" }}>
              {formaterPrix(groupeActuel.acompteFC, "FC")}
            </p>
          )}

          <p style={{ fontSize: "10.5px", fontWeight: "800", color: "#1E40AF", marginBottom: "6px", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Reste à payer à la remise
          </p>

          {groupeActuel.totalUSD - groupeActuel.acompteUSD > 0 && (
            <p style={{ fontSize: "13px", fontWeight: "800", color: "#1E3A5F", marginBottom: "2px" }}>
              {formaterPrix(groupeActuel.totalUSD - groupeActuel.acompteUSD, "USD")}
            </p>
          )}
          {groupeActuel.totalFC - groupeActuel.acompteFC > 0 && (
            <p style={{ fontSize: "13px", fontWeight: "800", color: "#1E3A5F" }}>
              {formaterPrix(groupeActuel.totalFC - groupeActuel.acompteFC, "FC")}
            </p>
          )}

          <p style={{ fontSize: "10px", color: "#475569", marginTop: "10px", lineHeight: 1.4, fontWeight: "500" }}>
            Envoyez l&apos;acompte à <strong>{vendeur?.nomBoutique}</strong> via l&apos;un des numéros ci-dessous.
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
                <button type="button" onClick={() => copier(vendeur.numMpesa!, "mpesa")} style={copierBtnStyle(copie === "mpesa")}>
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
                <button type="button" onClick={() => copier(vendeur.numOrange!, "orange")} style={copierBtnStyle(copie === "orange")}>
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
                <button type="button" onClick={() => copier(vendeur.numAirtel!, "airtel")} style={copierBtnStyle(copie === "airtel")}>
                  {copie === "airtel" ? "✅" : "📋"}
                </button>
              </div>
            </div>
          )}

          {aucunNumeroSpecifique && vendeur?.numMobileMoney && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center", marginTop: "10px" }}>
              <div style={logoBox}>
                <span style={{ fontSize: "18px" }}>📱</span>
              </div>
              <div style={numeroBoxStyle}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "9px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>
                    Mobile Money
                  </p>
                  <span style={{ fontSize: "12.5px", fontWeight: "800", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                    {vendeur.numMobileMoney}
                  </span>
                </div>
                <button type="button" onClick={() => copier(vendeur.numMobileMoney!, "mobile")} style={copierBtnStyle(copie === "mobile")}>
                  {copie === "mobile" ? "✅" : "📋"}
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
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />

        <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "10px", marginTop: "14px" }}>
          Articles de cette boutique
        </h2>

        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "12px",
          border: "1px solid #E8DFC8",
          marginBottom: "14px",
        }}>
          {groupeActuel.articles.map((a) => {
            const prixFinal = a.prixPromo !== null ? a.prixPromo : a.prix;
            const cleLigne = `${a.produitId}::${a.varianteId || "sv"}`;
            const labelVariante = formaterVariante(a.varianteInfo);

            return (
              <div key={cleLigne} style={{
                marginBottom: "8px",
                paddingBottom: "8px",
                borderBottom: "1px dashed #F1ECE0",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11.5px",
                }}>
                  <span style={{ color: "#334155", fontWeight: "700" }}>
                    {a.nom} × {a.quantite}
                  </span>
                  <span style={{ fontWeight: "700", color: "#0F172A" }}>
                    {formaterPrix(prixFinal * a.quantite, a.devise)}
                  </span>
                </div>
                {labelVariante && (
                  <p style={{
                    fontSize: "10px",
                    color: "#1D4ED8",
                    fontWeight: "700",
                    backgroundColor: "#EFF6FF",
                    display: "inline-block",
                    padding: "2px 7px",
                    borderRadius: "5px",
                    marginTop: "3px",
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
            paddingTop: "6px",
          }}>
            <span style={{ fontWeight: "900", fontSize: "13px", color: "#0F172A" }}>TOTAL</span>
            <div style={{ textAlign: "right" }}>
              {groupeActuel.totalUSD > 0 && (
                <p style={{ fontSize: "14px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                  {formaterPrix(groupeActuel.totalUSD, "USD")}
                </p>
              )}
              {groupeActuel.totalFC > 0 && (
                <p style={{ fontSize: "14px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.2 }}>
                  {formaterPrix(groupeActuel.totalFC, "FC")}
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
            backgroundColor: estDernier ? "#16a34a" : "#1D4ED8",
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
          {envoi
            ? "Envoi..."
            : estDernier
            ? "✅ Valider la dernière commande"
            : "➡️ Valider et passer à la boutique suivante"}
        </button>
      </form>
    </div>
  );
}

export default function PageMulti() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#FAF5E8", minHeight: "100vh" }}>
          <p>Chargement...</p>
        </div>
      }
    >
      <ContenuMulti />
    </Suspense>
  );
      }
