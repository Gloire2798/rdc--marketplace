"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, X } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  titre: string;
  message: string;
  lien: string | null;
  lu: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [ouvert, setOuvert] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [chargement, setChargement] = useState(false);
  const panneauRef = useRef<HTMLDivElement>(null);

  const charger = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.succes) {
        setNotifications(data.notifications || []);
        setNonLues(data.nonLues || 0);
      }
    } catch {}
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 30000); // toutes les 30s
    return () => clearInterval(interval);
  }, []);

  // Fermer si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panneauRef.current && !panneauRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    if (ouvert) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ouvert]);

  const marquerLue = async (id: string, lien: string | null) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
      );
      setNonLues((prev) => Math.max(0, prev - 1));
      if (lien) window.location.href = lien;
    } catch {}
  };

  const toutMarquerLue = async () => {
    setChargement(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
      setNonLues(0);
    } catch {}
    setChargement(false);
  };

  const formaterDate = (date: string) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h} h`;
    const j = Math.floor(h / 24);
    if (j < 7) return `il y a ${j} j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div ref={panneauRef} style={{ position: "relative" }}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOuvert(!ouvert)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          color: "#0F172A",
        }}
        aria-label="Notifications"
      >
        <Bell size={22} strokeWidth={2.8} />
        {nonLues > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-4px",
              backgroundColor: "#dc2626",
              color: "white",
              fontSize: "9.5px",
              fontWeight: "800",
              minWidth: "16px",
              height: "16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {nonLues > 99 ? "99+" : nonLues}
          </span>
        )}
      </button>

      {/* Panneau */}
      {ouvert && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "320px",
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "420px",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.15)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* En-tête */}
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #F1F5F9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A" }}>
              Notifications
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {nonLues > 0 && (
                <button
                  onClick={toutMarquerLue}
                  disabled={chargement}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "10.5px",
                    fontWeight: "700",
                    color: "#1D4ED8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <Check size={11} strokeWidth={3} />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOuvert(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</p>
                <p style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600" }}>
                  Aucune notification
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => marquerLue(n.id, n.lien)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    backgroundColor: n.lu ? "white" : "#EFF6FF",
                    borderBottom: "1px solid #F1F5F9",
                    border: "none",
                    borderLeft: n.lu ? "3px solid transparent" : "3px solid #1D4ED8",
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: n.lu ? "600" : "800",
                      color: "#0F172A",
                      marginBottom: "3px",
                    }}
                  >
                    {n.titre}
                  </p>
                  <p
                    style={{
                      fontSize: "10.5px",
                      color: "#475569",
                      fontWeight: "500",
                      lineHeight: 1.4,
                      marginBottom: "4px",
                    }}
                  >
                    {n.message}
                  </p>
                  <p
                    style={{
                      fontSize: "9.5px",
                      color: "#94a3b8",
                      fontWeight: "600",
                    }}
                  >
                    {formaterDate(n.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
        }
