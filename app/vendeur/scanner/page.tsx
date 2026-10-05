"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Scan, Check, X, Package, Phone, MapPin, AlertTriangle, MessageCircle, Lightbulb, User } from "lucide-react";

interface DetailsCommande {
  id: string;
  nomClient: string;
  telephoneClient: string;
  adresse: string | null;
  mode: string;
  totalFC: number;
  totalUSD: number;
  acompteFC: number;
  acompteUSD: number;
  resteFC: number;
  resteUSD: number;
  statut: string;
  createdAt: string;
  nomBoutique: string;
  items: {
    nom: string;
    quantite: number;
    prixUnitaire: number;
    devise: string;
  }[];
}

interface ErreurSpeciale {
  message: string;
  boutiqueProprietaire?: string;
  whatsappAdmin?: string | null;
}

export default function ScannerPage() {
  const [scanActif, setScanActif] = useState(false);
  const [resultat, setResultat] = useState<DetailsCommande | null>(null);
  const [erreur, setErreur] = useState("");
  const [erreurSpeciale, setErreurSpeciale] = useState<ErreurSpeciale | null>(null);
  const [valide, setValide] = useState(false);
  const [chargement, setChargement] = useState(false);
  const scannerRef = useRef<any>(null);

  const demarrerScanner = async () => {
    setErreur("");
    setErreurSpeciale(null);
    setResultat(null);
    setValide(false);
    setScanActif(true);

    const { Html5Qrcode } = await import("html5-qrcode");

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (texteDecode: string) => {
          scanner.stop().then(() => {
            setScanActif(false);
            validerQR(texteDecode);
          });
        },
        () => {}
      );
    } catch (err) {
      setErreur("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanActif(false);
    }
  };

  const arreterScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
    setScanActif(false);
  };

  const validerQR = async (qrToken: string) => {
    setChargement(true);
    setErreur("");
    setErreurSpeciale(null);

    try {
      const res = await fetch("/api/vendeur/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.erreur === "QR_MAUVAISE_BOUTIQUE") {
          setErreurSpeciale({
            message: data.message || "Ce QR n'appartient pas à votre boutique.",
            boutiqueProprietaire: data.boutiqueProprietaire,
            whatsappAdmin: data.whatsappAdmin,
          });
          setChargement(false);
          return;
        }

        setErreur(data.erreur || "QR invalide");
        setChargement(false);
        return;
      }

      setResultat(data.commande);
      setChargement(false);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  const confirmerRetrait = async () => {
    if (!resultat) return;
    setChargement(true);

    try {
      const res = await fetch("/api/vendeur/scanner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandeId: resultat.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErreur(data.erreur || "Erreur");
        setChargement(false);
        return;
      }

      setValide(true);
      setChargement(false);
    } catch {
      setErreur("Impossible de contacter le serveur");
      setChargement(false);
    }
  };

  useEffect(() => {
    return () => {
      arreterScanner();
    };
  }, []);

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") return `${prix.toFixed(2)} $`;
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const ouvrirWhatsApp = (num: string, boutique: string) => {
    const numero = num.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Bonjour, je suis vendeur sur GK Sensei. Un client m'a présenté un QR qui appartient à la boutique "${boutique}". Pouvez-vous m'aider ?`
    );
    window.open(`https://wa.me/${numero}?text=${message}`, "_blank");
  };

  const titreSection = {
    fontSize: "11px",
    fontWeight: "900" as const,
    color: "#0F172A",
    marginBottom: "10px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  const traitOrange = {
    display: "inline-block",
    width: "3px",
    height: "12px",
    backgroundColor: "#EA580C",
    borderRadius: "2px",
  };  return (
    <div style={{ padding: "16px 12px 30px 12px", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <Link
        href="/vendeur/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#0F172A",
          fontSize: "11px",
          fontWeight: "800",
          textDecoration: "none",
          marginBottom: "14px",
        }}
      >
        <ArrowLeft size={12} strokeWidth={2.8} />
        Retour
      </Link>

      <h1 style={{
        fontSize: "22px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "3px",
        letterSpacing: "-0.4px",
      }}>
        Scanner un QR
      </h1>
      <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700", marginBottom: "18px" }}>
        Scannez le QR du client pour valider le retrait.
      </p>

      {erreur && (
        <div style={{
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
          padding: "12px",
          borderRadius: "14px",
          marginBottom: "14px",
          fontSize: "11.5px",
          fontWeight: "800",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1.5px solid #DC2626",
        }}>
          <AlertTriangle size={16} strokeWidth={2.8} style={{ flexShrink: 0 }} />
          {erreur}
        </div>
      )}

      {erreurSpeciale && (
        <div style={{
          backgroundColor: "white",
          border: "1.5px solid #0F172A",
          borderRadius: "20px",
          padding: "16px",
          marginBottom: "14px",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#FEF3C7",
              flexShrink: 0,
            }}>
              <AlertTriangle size={18} color="#B45309" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "13px",
                fontWeight: "900",
                color: "#0F172A",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Mauvaise boutique
              </p>
              <p style={{ fontSize: "11.5px", fontWeight: "700", color: "#57534E", lineHeight: 1.5 }}>
                {erreurSpeciale.message}
              </p>
            </div>
          </div>

          {erreurSpeciale.whatsappAdmin && (
            <button
              onClick={() =>
                ouvrirWhatsApp(
                  erreurSpeciale.whatsappAdmin!,
                  erreurSpeciale.boutiqueProprietaire || "inconnue"
                )
              }
              style={{
                width: "100%",
                backgroundColor: "#25D366",
                color: "white",
                padding: "12px",
                borderRadius: "24px",
                border: "none",
                fontWeight: "900",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(37, 211, 102, 0.25)",
                fontFamily: "inherit",
              }}
            >
              <MessageCircle size={16} strokeWidth={2.8} />
              Contacter l&apos;administrateur
            </button>
          )}
        </div>
      )}

      {valide && resultat && (
        <div style={{
          backgroundColor: "white",
          border: "1.5px solid #16A34A",
          borderRadius: "20px",
          padding: "20px 16px",
          marginBottom: "14px",
          textAlign: "center",
          boxShadow: "4px 4px 0 #16A34A",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#DCFCE7",
            marginBottom: "10px",
          }}>
            <Check size={34} color="#16A34A" strokeWidth={3} />
          </div>
          <p style={{
            fontSize: "15px",
            fontWeight: "900",
            marginBottom: "4px",
            color: "#15803D",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            Commande retirée
          </p>
          <p style={{ fontSize: "11.5px", fontWeight: "700", color: "#57534E" }}>
            Le QR est maintenant invalidé.
          </p>
        </div>
      )}

      {!resultat && !valide && (
        <>
          {!scanActif ? (
            <button
              onClick={demarrerScanner}
              disabled={chargement}
              style={{
                width: "100%",
                backgroundColor: "#0F172A",
                color: "white",
                padding: "16px",
                borderRadius: "26px",
                border: "none",
                fontWeight: "900",
                fontSize: "13.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "14px",
                opacity: chargement ? 0.6 : 1,
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
                letterSpacing: "-0.2px",
                fontFamily: "inherit",
              }}
            >
              <Scan size={18} strokeWidth={2.8} />
              {chargement ? "Traitement..." : "Démarrer le scan"}
            </button>
          ) : (
            <>
              <div
                id="qr-reader"
                style={{
                  width: "100%",
                  borderRadius: "20px",
                  overflow: "hidden",
                  marginBottom: "10px",
                  backgroundColor: "#000",
                  border: "1.5px solid #0F172A",
                  boxShadow: "4px 4px 0 #EA580C",
                }}
              />
              <button
                onClick={arreterScanner}
                style={{
                  width: "100%",
                  backgroundColor: "white",
                  color: "#DC2626",
                  padding: "14px",
                  borderRadius: "24px",
                  border: "1.5px solid #DC2626",
                  fontWeight: "900",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontFamily: "inherit",
                }}
              >
                <X size={16} strokeWidth={2.8} />
                Arrêter le scan
              </button>
            </>
          )}

          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "16px",
            border: "1px solid #D4C5A0",
            marginTop: "14px",
            boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
          }}>
            <p style={titreSection}>
              <span style={traitOrange} />
              <Lightbulb size={13} strokeWidth={2.8} color="#EA580C" />
              Comment ça marche
            </p>
            <ul style={{
              fontSize: "11px",
              color: "#57534E",
              fontWeight: "700",
              paddingLeft: "18px",
              lineHeight: 1.7,
            }}>
              <li>Demandez le QR au client</li>
              <li>Cliquez sur &quot;Démarrer le scan&quot;</li>
              <li>Pointez la caméra vers le QR</li>
              <li>Vérifiez les infos affichées</li>
              <li>Validez le retrait</li>
            </ul>
          </div>
        </>
      )}

      {resultat && !valide && (
        <div>
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "16px",
            border: "1px solid #D4C5A0",
            marginBottom: "12px",
            boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
              paddingBottom: "12px",
              borderBottom: "1px dashed #D4C5A0",
            }}>
              <Package size={18} color="#EA580C" strokeWidth={2.8} />
              <p style={{ fontSize: "13px", fontWeight: "900", color: "#0F172A" }}>
                Commande #{resultat.id.slice(0, 8)}
              </p>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <p style={{
                fontSize: "10px",
                color: "#57534E",
                fontWeight: "900",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Client
              </p>
              <p style={{
                fontSize: "13.5px",
                fontWeight: "900",
                color: "#0F172A",
                marginBottom: "5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <User size={13} strokeWidth={2.8} />
                {resultat.nomClient}
              </p>
              <p style={{
                fontSize: "11.5px",
                color: "#57534E",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "4px",
              }}>
                <Phone size={11} strokeWidth={2.8} />
                {resultat.telephoneClient}
              </p>
              {resultat.adresse && (
                <p style={{
                  fontSize: "11.5px",
                  color: "#57534E",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <MapPin size={11} strokeWidth={2.8} />
                  {resultat.adresse}
                </p>
              )}
            </div>

            <div style={{
              backgroundColor: "#F5EAD2",
              borderRadius: "14px",
              padding: "12px",
              marginBottom: "14px",
              border: "1px solid #D4C5A0",
            }}>
              <p style={{
                fontSize: "10px",
                color: "#57534E",
                fontWeight: "900",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Total
              </p>
              {resultat.totalUSD > 0 && (
                <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A", lineHeight: 1.3 }}>
                  {formaterPrix(resultat.totalUSD, "USD")}
                </p>
              )}
              {resultat.totalFC > 0 && (
                <p style={{ fontSize: "14px", fontWeight: "900", color: "#0F172A", lineHeight: 1.3, marginBottom: resultat.totalUSD > 0 ? "10px" : "0" }}>
                  {formaterPrix(resultat.totalFC, "FC")}
                </p>
              )}

              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #D4C5A0" }}>
                <p style={{
                  fontSize: "10px",
                  color: "#15803D",
                  fontWeight: "900",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Acompte payé
                </p>
                {resultat.acompteUSD > 0 && (
                  <p style={{ fontSize: "12.5px", fontWeight: "900", color: "#15803D", lineHeight: 1.3 }}>
                    {formaterPrix(resultat.acompteUSD, "USD")}
                  </p>
                )}
                {resultat.acompteFC > 0 && (
                  <p style={{ fontSize: "12.5px", fontWeight: "900", color: "#15803D", lineHeight: 1.3 }}>
                    {formaterPrix(resultat.acompteFC, "FC")}
                  </p>
                )}
              </div>

              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #D4C5A0" }}>
                <p style={{
                  fontSize: "10px",
                  color: "#EA580C",
                  fontWeight: "900",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Reste à encaisser
                </p>
                {resultat.resteUSD > 0 && (
                  <p style={{ fontSize: "17px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                    {formaterPrix(resultat.resteUSD, "USD")}
                  </p>
                )}
                {resultat.resteFC > 0 && (
                  <p style={{ fontSize: "17px", fontWeight: "900", color: "#EA580C", lineHeight: 1.2, letterSpacing: "-0.3px" }}>
                    {formaterPrix(resultat.resteFC, "FC")}
                  </p>
                )}
              </div>
            </div>

            <p style={{
              fontSize: "10px",
              color: "#57534E",
              fontWeight: "900",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Articles
            </p>
            <div style={{
              backgroundColor: "#F5EAD2",
              borderRadius: "12px",
              padding: "10px 12px",
              marginBottom: "4px",
              border: "1px solid #D4C5A0",
            }}>
              {resultat.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11.5px",
                    marginBottom: idx < resultat.items.length - 1 ? "5px" : "0",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "#0F172A", fontWeight: "800", minWidth: 0, flex: 1 }}>
                    {item.nom} × {item.quantite}
                  </span>
                  <span style={{ color: "#57534E", fontWeight: "800", flexShrink: 0 }}>
                    {formaterPrix(item.prixUnitaire * item.quantite, item.devise)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={confirmerRetrait}
            disabled={chargement}
            style={{
              width: "100%",
              backgroundColor: "#16A34A",
              color: "white",
              padding: "16px",
              borderRadius: "26px",
              border: "none",
              fontWeight: "900",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "10px",
              opacity: chargement ? 0.6 : 1,
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
              letterSpacing: "-0.2px",
              fontFamily: "inherit",
            }}
          >
            <Check size={16} strokeWidth={3} />
            {chargement ? "Validation..." : "Confirmer le retrait"}
          </button>

          <button
            onClick={() => {
              setResultat(null);
              setValide(false);
              setErreur("");
              setErreurSpeciale(null);
            }}
            style={{
              width: "100%",
              backgroundColor: "white",
              color: "#0F172A",
              padding: "14px",
              borderRadius: "26px",
              border: "1.5px solid #0F172A",
              fontWeight: "900",
              fontSize: "12.5px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Annuler
          </button>
        </div>
      )}

      {valide && (
        <button
          onClick={() => {
            setResultat(null);
            setValide(false);
            setErreur("");
            setErreurSpeciale(null);
          }}
          style={{
            width: "100%",
            backgroundColor: "#0F172A",
            color: "white",
            padding: "16px",
            borderRadius: "26px",
            border: "none",
            fontWeight: "900",
            fontSize: "13.5px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
            fontFamily: "inherit",
          }}
        >
          Scanner une autre commande
        </button>
      )}
    </div>
  );
    }
