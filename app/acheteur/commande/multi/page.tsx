"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Info,
  User,
  Phone,
  Store,
  Truck,
  Package,
  Check,
  Wallet,
  Smartphone,
} from "lucide-react";
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
  };if (chargement || groupes.length === 0) {
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
  fontSize: "13.5px",
  fontFamily: "inherit",
  backgroundColor: "white",
  outline: "none",
  color: "#0F172A",
  fontWeight: "700" as const,
  boxSizing: "border-box" as const,
  marginBottom: "10px",
};

const labelStyle = {
  display: "block" as const,
  marginBottom: "6px",
  fontWeight: "900" as const,
  fontSize: "11px",
  color: "#0F172A",
  textTransform: "uppercase" as const,
  letterSpacing: "0.4px",
};

const titreSection = {
  fontSize: "12px",
  fontWeight: "900" as const,
  color: "#0F172A",
  marginBottom: "10px",
  marginTop: "14px",
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
  fontFamily: "inherit",
});

const aucunNumeroSpecifique =
  !vendeur?.numMpesa && !vendeur?.numOrange && !vendeur?.numAirtel;

return (
  <div style={{ padding: "16px 12px 40px 12px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
    <Link
      href="/acheteur/panier"
      style={{
        color: "#0F172A",
        fontSize: "11.5px",
        fontWeight: "800",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <ArrowLeft size={12} strokeWidth={2.8} />
      Retour au panier
    </Link>

    {/* BARRE PROGRESSION */}
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
            backgroundColor: i <= indexActuel ? "#EA580C" : "#D4C5A0",
          }}
        />
      ))}
    </div>

    <p style={{
      textAlign: "center",
      fontSize: "11.5px",
      fontWeight: "900",
      color: "#0F172A",
      marginBottom: "14px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}>
      Commande {indexActuel + 1} sur {groupes.length}
    </p>

    {/* HEADER BOUTIQUE */}
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
    }}>
      <Store size={18} strokeWidth={2.8} color="#EA580C" />
      <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", letterSpacing: "-0.4px" }}>
        {groupeActuel.nomBoutique}
      </h1>
    </div>
    <p style={{ color: "#57534E", marginBottom: "18px", fontSize: "11.5px", fontWeight: "700" }}>
      {groupeActuel.articles.length} article{groupeActuel.articles.length > 1 ? "s" : ""} chez cette boutique
    </p>

    {/* INFO MULTI-BOUTIQUES */}
    {groupes.length > 1 && indexActuel === 0 && (
      <div style={{
        backgroundColor: "white",
        color: "#0F172A",
        padding: "12px 14px",
        borderRadius: "16px",
        marginBottom: "14px",
        border: "1.5px solid #0F172A",
        boxShadow: "4px 4px 0 #EA580C",
      }}>
        <p style={{
          fontWeight: "900",
          fontSize: "11.5px",
          marginBottom: "4px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          <Info size={13} strokeWidth={2.8} color="#EA580C" />
          {groupes.length} boutiques
        </p>
        <p style={{ fontSize: "11px", fontWeight: "700", color: "#57534E", lineHeight: 1.5 }}>
          Nous allons passer vos commandes une par une. Vos infos seront conservées d&apos;une boutique à l&apos;autre.
        </p>
      </div>
    )}

    {erreur && (
      <div style={{
        backgroundColor: "#FEE2E2",
        color: "#991B1B",
        padding: "12px",
        borderRadius: "14px",
        marginBottom: "14px",
        fontSize: "11.5px",
        fontWeight: "800",
        border: "1.5px solid #DC2626",
      }}>
        {erreur}
      </div>
    )}

    <form onSubmit={soumettre}>        {indexActuel === 0 && (
          <>
            <h2 style={titreSection}>
              <span style={traitOrange} />
              <User size={13} strokeWidth={2.8} color="#EA580C" />
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

            <h2 style={titreSection}>
              <span style={traitOrange} />
              <Truck size={13} strokeWidth={2.8} color="#EA580C" />
              Mode de réception
            </h2>

            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              <button
                type="button"
                onClick={() => setInfos({ ...infos, mode: "RETRAIT" })}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "14px",
                  border: infos.mode === "RETRAIT" ? "2px solid #0F172A" : "1.5px solid #D4C5A0",
                  backgroundColor: infos.mode === "RETRAIT" ? "#0F172A" : "white",
                  color: infos.mode === "RETRAIT" ? "white" : "#0F172A",
                  fontWeight: "900",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontFamily: "inherit",
                }}
              >
                <Store size={13} strokeWidth={2.8} />
                Retrait
              </button>
              <button
                type="button"
                onClick={() => setInfos({ ...infos, mode: "LIVRAISON" })}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "14px",
                  border: infos.mode === "LIVRAISON" ? "2px solid #0F172A" : "1.5px solid #D4C5A0",
                  backgroundColor: infos.mode === "LIVRAISON" ? "#0F172A" : "white",
                  color: infos.mode === "LIVRAISON" ? "white" : "#0F172A",
                  fontWeight: "900",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontFamily: "inherit",
                }}
              >
                <Truck size={13} strokeWidth={2.8} />
                Livraison
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
            backgroundColor: "white",
            border: "1.5px solid #0F172A",
            borderRadius: "14px",
            padding: "12px",
            marginBottom: "14px",
            boxShadow: "3px 3px 0 #EA580C",
          }}>
            <p style={{
              fontSize: "11.5px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <User size={13} strokeWidth={2.8} color="#EA580C" />
              {infos.nom}
              <span style={{ color: "#D4C5A0" }}>·</span>
              <Phone size={13} strokeWidth={2.8} color="#EA580C" />
              {infos.telephone}
            </p>
            <p style={{ fontSize: "10.5px", color: "#57534E", fontWeight: "700", lineHeight: 1.5 }}>
              Vos infos sont conservées. Il ne reste que la référence de paiement à saisir.
            </p>
          </div>
        )}

        <h2 style={titreSection}>
          <span style={traitOrange} />
          <Wallet size={13} strokeWidth={2.8} color="#EA580C" />
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

          {groupeActuel.acompteUSD > 0 && (
            <p style={{ fontSize: "20px", fontWeight: "900", color: "#EA580C", marginBottom: "2px", letterSpacing: "-0.3px" }}>
              {formaterPrix(groupeActuel.acompteUSD, "USD")}
            </p>
          )}
          {groupeActuel.acompteFC > 0 && (
            <p style={{ fontSize: "20px", fontWeight: "900", color: "#EA580C", marginBottom: "8px", letterSpacing: "-0.3px" }}>
              {formaterPrix(groupeActuel.acompteFC, "FC")}
            </p>
          )}

          <div style={{ borderTop: "1px dashed #D4C5A0", paddingTop: "10px", marginTop: "8px" }}>
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

            {groupeActuel.totalUSD - groupeActuel.acompteUSD > 0 && (
              <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A", marginBottom: "2px" }}>
                {formaterPrix(groupeActuel.totalUSD - groupeActuel.acompteUSD, "USD")}
              </p>
            )}
            {groupeActuel.totalFC - groupeActuel.acompteFC > 0 && (
              <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A" }}>
                {formaterPrix(groupeActuel.totalFC - groupeActuel.acompteFC, "FC")}
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
                <button type="button" onClick={() => copier(vendeur.numMpesa!, "mpesa")} style={copierBtnStyle(copie === "mpesa")}>
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
                <button type="button" onClick={() => copier(vendeur.numOrange!, "orange")} style={copierBtnStyle(copie === "orange")}>
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
                <button type="button" onClick={() => copier(vendeur.numAirtel!, "airtel")} style={copierBtnStyle(copie === "airtel")}>
                  {copie === "airtel" ? "Copié" : "Copier"}
                </button>
              </div>
            </div>
          )}

          {aucunNumeroSpecifique && vendeur?.numMobileMoney && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px", alignItems: "center", marginTop: "12px" }}>
              <div style={logoBox}>
                <Smartphone size={16} color="#0F172A" strokeWidth={2.5} />
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
                <button type="button" onClick={() => copier(vendeur.numMobileMoney!, "mobile")} style={copierBtnStyle(copie === "mobile")}>
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
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          required
        />

        <h2 style={titreSection}>
          <span style={traitOrange} />
          <Package size={13} strokeWidth={2.8} color="#EA580C" />
          Articles de cette boutique
        </h2>

        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "14px",
          border: "1.5px solid #0F172A",
          marginBottom: "16px",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          {groupeActuel.articles.map((a) => {
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
                  gap: "8px",
                }}>
                  <span style={{ color: "#0F172A", fontWeight: "800", minWidth: 0, flex: 1 }}>
                    {a.nom} × {a.quantite}
                  </span>
                  <span style={{ fontWeight: "900", color: "#0F172A", flexShrink: 0 }}>
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
              {groupeActuel.totalUSD > 0 && (
                <p style={{ fontSize: "17px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                  {formaterPrix(groupeActuel.totalUSD, "USD")}
                </p>
              )}
              {groupeActuel.totalFC > 0 && (
                <p style={{ fontSize: "17px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
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
            backgroundColor: estDernier ? "#16A34A" : "#0F172A",
            color: "white",
            padding: "16px",
            borderRadius: "26px",
            border: "none",
            fontWeight: "900",
            fontSize: "14px",
            cursor: "pointer",
            opacity: envoi ? 0.6 : 1,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
            letterSpacing: "-0.2px",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {envoi ? (
            "Envoi..."
          ) : estDernier ? (
            <>
              <Check size={16} strokeWidth={3} />
              Valider la dernière commande
            </>
          ) : (
            <>
              Valider et passer à la suivante
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PageMulti() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "60px 16px", textAlign: "center", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
          <p style={{ color: "#57534E", fontWeight: "700" }}>Chargement...</p>
        </div>
      }
    >
      <ContenuMulti />
    </Suspense>
  );
      }
