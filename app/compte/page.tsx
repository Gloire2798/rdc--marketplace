import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, Store, ShoppingBag, Shield } from "lucide-react";

export default async function PageCompte() {
  const session = await getSession();

  // Si connecté, rediriger selon le rôle
  if (session) {
    if (session.role === "ADMIN") redirect("/admin/dashboard");
    if (session.role === "VENDEUR") redirect("/vendeur/dashboard");
    if (session.role === "ACHETEUR") redirect("/client/compte");
  }

  return (
    <div className="container" style={{ padding: "30px 18px", maxWidth: "500px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div style={{
          width: "70px",
          height: "70px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "900",
          fontSize: "28px",
          margin: "0 auto 16px auto",
          boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
        }}>
          GK
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A", marginBottom: "6px", letterSpacing: "-0.3px" }}>
          Mon compte
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
          Connectez-vous ou créez un compte
        </p>
      </div>

      {/* Connexion */}
      <Link
        href="/vendeur/connexion"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "#1D4ED8",
          color: "white",
          padding: "14px 18px",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: "700",
          fontSize: "14px",
          marginBottom: "10px",
          boxShadow: "0 2px 8px rgba(29, 78, 216, 0.2)",
        }}
      >
        <LogIn size={20} strokeWidth={2.5} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "800" }}>Se connecter</div>
          <div style={{ fontSize: "11px", opacity: 0.85, fontWeight: "500", marginTop: "2px" }}>
            Vous avez déjà un compte
          </div>
        </div>
      </Link>

      {/* Créer un compte client */}
      <Link
        href="/client/inscription"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "white",
          color: "#0F172A",
          padding: "14px 18px",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: "700",
          fontSize: "14px",
          marginBottom: "10px",
          border: "1.5px solid #E2E8F0",
        }}
      >
        <UserPlus size={20} strokeWidth={2.5} color="#1D4ED8" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "800" }}>Créer un compte client</div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", marginTop: "2px" }}>
            Commandez plus vite
          </div>
        </div>
      </Link>

      {/* Devenir vendeur */}
      <Link
        href="/vendeur/inscription"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "white",
          color: "#0F172A",
          padding: "14px 18px",
          borderRadius: "12px",
          textDecoration: "none",
          fontWeight: "700",
          fontSize: "14px",
          marginBottom: "20px",
          border: "1.5px solid #E2E8F0",
        }}
      >
        <Store size={20} strokeWidth={2.5} color="#16a34a" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "800" }}>Devenir vendeur</div>
          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", marginTop: "2px" }}>
            Ouvrez votre boutique en ligne
          </div>
        </div>
      </Link>

      {/* Liens secondaires */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "20px",
        paddingTop: "20px",
        borderTop: "1px solid #F1F5F9",
      }}>
        <Link href="/boutiques" style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#64748b",
          fontSize: "12px",
          fontWeight: "700",
          textDecoration: "none",
        }}>
          <ShoppingBag size={14} strokeWidth={2.5} />
          Voir les boutiques
        </Link>
        <Link href="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "#64748b",
          fontSize: "12px",
          fontWeight: "700",
          textDecoration: "none",
        }}>
          <Shield size={14} strokeWidth={2.5} />
          Accueil
        </Link>
      </div>
    </div>
  );
      }
