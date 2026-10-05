import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CarteCommande from "./CarteCommande";
import { ArrowLeft, Clock, CheckCircle, Package, PackageX } from "lucide-react";

export default async function MesCommandes() {
  const session = await getSession();

  if (!session || session.role !== "VENDEUR") {
    redirect("/vendeur/connexion");
  }

  const vendeur = await prisma.vendeur.findUnique({
    where: { userId: session.id },
  });

  if (!vendeur) {
    redirect("/vendeur/dashboard");
  }

  const commandes = await prisma.commande.findMany({
    where: {
      vendeurId: vendeur.id,
      statut: { not: "ANNULE" },
    },
    include: {
      acheteur: true,
      items: {
        include: {
          produit: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formaterCommande = (c: typeof commandes[0]) => {
    let totalFC = 0;
    let totalUSD = 0;

    const itemsFormates = c.items.map((i) => {
      const montant = i.prixUnitaire * i.quantite;

      if (i.produit.devise === "USD") {
        totalUSD += montant;
      } else {
        totalFC += montant;
      }

      return {
        nom: i.produit.nom,
        quantite: i.quantite,
        prixUnitaire: i.prixUnitaire,
        devise: i.produit.devise,
      };
    });

    return {
      id: c.id,
      statut: c.statut,
      totalFC,
      totalUSD,
      mode: c.mode,
      adresse: c.adresse,
      createdAt: c.createdAt.toISOString(),
      nomClient: c.nomClient || c.acheteur?.nom || "Client",
      telephoneClient: c.telephoneClient || c.acheteur?.telephone || "—",
      items: itemsFormates,
    };
  };

  const enAttente = commandes.filter((c) => c.statut === "EN_ATTENTE");
  const validees = commandes.filter((c) => c.statut === "PAYE" || c.statut === "PRET");
  const terminees = commandes.filter((c) => c.statut === "RETIRE");

  return (
    <div style={{ padding: "16px 12px 100px 12px", backgroundColor: "#F5EAD2", minHeight: "100vh" }}>
      <Link
        href="/vendeur/dashboard"
        style={{
          color: "#0F172A",
          fontSize: "11px",
          fontWeight: "800",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <ArrowLeft size={12} strokeWidth={2.8} />
        Retour au tableau de bord
      </Link>

      <h1 style={{
        fontSize: "22px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "3px",
        marginTop: "12px",
        letterSpacing: "-0.4px",
      }}>
        Mes commandes
      </h1>
      <p style={{ color: "#57534E", fontSize: "11.5px", fontWeight: "700", marginBottom: "18px" }}>
        Gérez les commandes de vos clients.
      </p>

      {/* STATS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "6px",
        marginBottom: "20px",
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 8px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <Clock size={16} color="#B45309" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{ color: "#57534E", fontSize: "9.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>
            En attente
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#B45309", lineHeight: 1 }}>
            {enAttente.length}
          </h2>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 8px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <CheckCircle size={16} color="#1D4ED8" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{ color: "#57534E", fontSize: "9.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>
            Validées
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1 }}>
            {validees.length}
          </h2>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 8px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <Package size={16} color="#16A34A" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{ color: "#57534E", fontSize: "9.5px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "4px" }}>
            Terminées
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#16A34A", lineHeight: 1 }}>
            {terminees.length}
          </h2>
        </div>
      </div>

      {commandes.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: "20px",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            marginBottom: "10px",
          }}>
            <PackageX size={26} color="#EA580C" strokeWidth={2} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "900", marginBottom: "4px", color: "#0F172A" }}>
            Aucune commande
          </p>
          <p style={{ color: "#57534E", fontSize: "11px", fontWeight: "600" }}>
            Vos commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {enAttente.length > 0 && (
            <>
              <h2 style={{
                fontSize: "12px",
                fontWeight: "900",
                marginBottom: "8px",
                color: "#B45309",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{ display: "inline-block", width: "3px", height: "12px", backgroundColor: "#B45309", borderRadius: "2px" }} />
                En attente ({enAttente.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {enAttente.map((c) => (
                  <CarteCommande key={c.id} commande={formaterCommande(c)} />
                ))}
              </div>
            </>
          )}

          {validees.length > 0 && (
            <>
              <h2 style={{
                fontSize: "12px",
                fontWeight: "900",
                marginBottom: "8px",
                color: "#1D4ED8",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{ display: "inline-block", width: "3px", height: "12px", backgroundColor: "#1D4ED8", borderRadius: "2px" }} />
                Validées ({validees.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {validees.map((c) => (
                  <CarteCommande key={c.id} commande={formaterCommande(c)} />
                ))}
              </div>
            </>
          )}

          {terminees.length > 0 && (
            <>
              <h2 style={{
                fontSize: "12px",
                fontWeight: "900",
                marginBottom: "8px",
                color: "#16A34A",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span style={{ display: "inline-block", width: "3px", height: "12px", backgroundColor: "#16A34A", borderRadius: "2px" }} />
                Terminées ({terminees.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {terminees.map((c) => (
                  <CarteCommande key={c.id} commande={formaterCommande(c)} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
            }
