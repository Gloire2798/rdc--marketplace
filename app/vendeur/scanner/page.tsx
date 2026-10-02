"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Scan, Check, X, Package, Phone, MapPin, AlertTriangle, MessageCircle } from "lucide-react";

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

  return (
    <div style={{ padding: "16px 14px 20px 14px", backgroundColor: "#F3F4F6", minHeight: "100vh" }}>
      <Link href="/vendeur/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#1D4ED8", fontSize: "11.5px", fontWeight: "700", textDecoration: "none", marginBottom: "14px" }}>
        <ArrowLeft size={14} strokeWidth={2.5} />
        Retour
      </Link>

      <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
        Scanner un QR
      </h1>
      <p style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600", marginBottom: "18px" }}>
        Scannez le QR du client pour valider le retrait.
      </p>

      {erreur && (
        <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "10px 12px", borderRadius: "10px", marginBottom: "14px", fontSize: "11.5px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
          <AlertTriangle size={14} strokeWidth={2.5} />
          {erreur}
        </div>
      )}

      {erreurSpeciale && (
        <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "12px", padding: "14px", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
            <AlertTriangle size={18} color="#B45309" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: "900", color: "#78350F", marginBottom: "4px" }}>
                Mauvaise boutique
              </p>
              <p style={{ fontSize: "11.5px", fontWeight: "600", color: "#78350F", lineHeight: 1.5 }}>
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
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                fontWeight: "800",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <MessageCircle size={16} strokeWidth={2.5} />
              Contacter l'administrateur sur WhatsApp
            </button>
          )}
        </div>
      )}

      {valide && resultat && (
        <div style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "14px", borderRadius: "12px", marginBottom: "14px", textAlign: "center" }}>
          <Check size={32} strokeWidth={3} style={{ marginBottom: "6px" }} />
          <p style={{ fontSize: "14px", fontWeight: "900", marginBottom: "4px" }}>
            Commande retirée !
          </p>
          <p style={{ fontSize: "11px", fontWeight: "600" }}>
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
                backgroundColor: "#1D4ED8",
                color: "white",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "14px",
                opacity: chargement ? 0.6 : 1,
              }}
            >
              <Scan size={18} strokeWidth={2.5} />
              {chargement ? "Traitement..." : "Démarrer le scan"}
            </button>
          ) : (
            <>
              <div id="qr-reader" style={{ width: "100%", borderRadius: "12px", overflow: "hidden", marginBottom: "10px", backgroundColor: "#000" }} />
              <button
                onClick={arreterScanner}
                style={{
                  width: "100%",
                  backgroundColor: "#dc2626",
                  color: "white",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <X size={16} strokeWidth={2.5} />
                Arrêter le scan
              </button>
            </>
          )}

          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "14px", border: "1px solid #E2E8F0", marginTop: "14px" }}>
            <p style={{ fontSize: "11px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
              💡 Comment ça marche
            </p>
            <ul style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "500", paddingLeft: "16px", lineHeight: 1.6 }}>
              <li>Demandez le QR au client</li>
              <li>Cliquez sur "Démarrer le scan"</li>
              <li>Pointez la caméra vers le QR</li>
              <li>Vérifiez les infos affichées</li>
              <li>Validez le retrait</li>
            </ul>
          </div>
        </>
      )}

      {resultat && !valide && (
        <div>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "14px", border: "1px solid #E8DFC8", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px solid #F1ECE0" }}>
              <Package size={18} color="#1D4ED8" strokeWidth={2.5} />
              <p style={{ fontSize: "13px", fontWeight: "900", color: "#0F172A" }}>
                Commande #{resultat.id.slice(0, 8)}
              </p>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Client
              </p>
              <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A", marginBottom: "4px" }}>
                👤 {resultat.nomClient}
              </p>
              <p style={{ fontSize: "11.5px", color: "#334155", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
                <Phone size={11} strokeWidth={2.5} />
                {resultat.telephoneClient}
              </p>
              {resultat.adresse && (
                <p style={{ fontSize: "11.5px", color: "#334155", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={11} strokeWidth={2.5} />
                  {resultat.adresse}
                </p>
              )}
            </div>

            {/* Totaux séparés par devise */}
            <div style={{ backgroundColor: "#EFF6FF", borderRadius: "10px", padding: "10px", marginBottom: "12px" }}>
              <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total
              </p>
              {resultat.totalUSD > 0 && (
                <p style={{ fontSize: "13px", fontWeight: "900", color: "#0F172A", lineHeight: 1.3 }}>
                  {formaterPrix(resultat.totalUSD, "USD")}
                </p>
              )}
              {resultat.totalFC > 0 && (
                <p style={{ fontSize: "13px", fontWeight: "900", color: "#0F172A", lineHeight: 1.3, marginBottom: resultat.totalUSD > 0 ? "10px" : "0" }}>
                  {formaterPrix(resultat.totalFC, "FC")}
                </p>
              )}

              <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #BFDBFE" }}>
                <p style={{ fontSize: "10px", color: "#16a34a", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Acompte payé
                </p>
                {resultat.acompteUSD > 0 && (
                  <p style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a", lineHeight: 1.3 }}>
                    {formaterPrix(resultat.acompteUSD, "USD")}
                  </p>
                )}
                {resultat.acompteFC > 0 && (
                  <p style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a", lineHeight: 1.3 }}>
                    {formaterPrix(resultat.acompteFC, "FC")}
                  </p>
                )}
              </div>

              <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #BFDBFE" }}>
                <p style={{ fontSize: "10px", color: "#1D4ED8", fontWeight: "800", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Reste à encaisser
                </p>
                {resultat.resteUSD > 0 && (
                  <p style={{ fontSize: "15px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.3 }}>
                    {formaterPrix(resultat.resteUSD, "USD")}
                  </p>
                )}
                {resultat.resteFC > 0 && (
                  <p style={{ fontSize: "15px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1.3 }}>
                    {formaterPrix(resultat.resteFC, "FC")}
                  </p>
                )}
              </div>
            </div>

            <p style={{ fontSize: "10px", color: "#64748b", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Articles
            </p>
            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "8px 10px", marginBottom: "4px" }}>
              {resultat.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: idx < resultat.items.length - 1 ? "4px" : "0", gap: "8px" }}>
                  <span style={{ color: "#334155", fontWeight: "600", minWidth: 0, flex: 1 }}>
                    {item.nom} × {item.quantite}
                  </span>
                  <span style={{ color: "#64748b", fontWeight: "700", flexShrink: 0 }}>
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
              backgroundColor: "#16a34a",
              color: "white",
              padding: "13px",
              borderRadius: "12px",
              border: "none",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "8px",
              opacity: chargement ? 0.6 : 1,
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
              color: "#64748b",
              padding: "12px",
              borderRadius: "12px",
              border: "1.5px solid #E2E8F0",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
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
            backgroundColor: "#1D4ED8",
            color: "white",
            padding: "13px",
            borderRadius: "12px",
            border: "none",
            fontWeight: "800",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Scanner une autre commande
        </button>
      )}
    </div>
  );
            }
