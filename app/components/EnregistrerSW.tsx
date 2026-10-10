"use client";

import { useEffect } from "react";

export default function EnregistrerSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("Erreur SW:", err));
  }, []);

  return null;
}
