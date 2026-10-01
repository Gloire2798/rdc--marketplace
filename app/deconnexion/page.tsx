"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PageDeconnexion() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/deconnexion", { method: "POST" })
      .then(() => {
        router.push("/");
        router.refresh();
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  return (
    <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
      <p style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>
        Déconnexion en cours...
      </p>
    </div>
  );
}
