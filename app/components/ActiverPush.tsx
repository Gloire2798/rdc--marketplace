"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function ActiverPush() {
  const [statut, setStatut] = useState<
    "chargement" | "inactif" | "actif" | "refuse" | "non-supporte"
  >("chargement");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setStatut("non-supporte");
      return;
    }

    if (Notification.permission === "denied") {
      setStatut("refuse");
      return;
    }

    navigator.serviceWorker.ready.then(async (registration) => {
      const abonnement = await registration.pushManager.getSubscription();
      setStatut(abonnement ? "actif" : "inactif");
    });
  }, []);

  const activer = async () => {
    setEnCours(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatut("refuse");
        setEnCours(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const clePublique = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!clePublique) {
        console.error("Clé VAPID publique manquante");
        setEnCours(false);
        return;
      }

      const abonnement = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(clePublique),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: abonnement.endpoint,
          keys: {
            p256dh: abonnement.toJSON().keys?.p256dh,
            auth: abonnement.toJSON().keys?.auth,
          },
          userAgent: navigator.userAgent,
        }),
      });

      setStatut("actif");
    } catch (error) {
      console.error("Erreur activation push:", error);
    }
    setEnCours(false);
  };

  const desactiver = async () => {
    setEnCours(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const abonnement = await registration.pushManager.getSubscription();

      if (abonnement) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: abonnement.endpoint }),
        });
        await abonnement.unsubscribe();
      }

      setStatut("inactif");
    } catch (error) {
      console.error("Erreur désactivation push:", error);
    }
    setEnCours(false);
  };

  if (statut === "chargement") return null;

  if (statut === "non-supporte") {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "14px",
        border: "1px solid #D4C5A0",
        fontSize: "11.5px",
        color: "#57534E",
        fontWeight: "700",
      }}>
        Votre navigateur ne supporte pas les notifications push.
      </div>
    );
  }

  if (statut === "refuse") {
    return (
      <div style={{
        backgroundColor: "#FEE2E2",
        borderRadius: "16px",
        padding: "14px",
        border: "1.5px solid #DC2626",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <BellOff size={20} color="#DC2626" strokeWidth={2.5} />
        <div>
          <p style={{ fontSize: "12px", fontWeight: "900", color: "#991B1B", marginBottom: "2px" }}>
            Notifications bloquées
          </p>
          <p style={{ fontSize: "10.5px", color: "#991B1B", fontWeight: "700" }}>
            Autorisez-les dans les réglages de votre navigateur.
          </p>
        </div>
      </div>
    );
  }

  if (statut === "actif") {
    return (
      <button
        onClick={desactiver}
        disabled={enCours}
        style={{
          width: "100%",
          backgroundColor: "white",
          color: "#16A34A",
          padding: "12px",
          borderRadius: "20px",
          border: "1.5px solid #16A34A",
          fontWeight: "900",
          fontSize: "12px",
          cursor: enCours ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontFamily: "inherit",
          opacity: enCours ? 0.6 : 1,
        }}
      >
        <Check size={14} strokeWidth={3} />
        Notifications activées
      </button>
    );
  }

  return (
    <button
      onClick={activer}
      disabled={enCours}
      style={{
        width: "100%",
        backgroundColor: "#0F172A",
        color: "white",
        padding: "12px",
        borderRadius: "20px",
        border: "none",
        fontWeight: "900",
        fontSize: "12px",
        cursor: enCours ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        fontFamily: "inherit",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
        opacity: enCours ? 0.6 : 1,
      }}
    >
      <Bell size={14} strokeWidth={2.8} />
      Activer les notifications
    </button>
  );
            }
