import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Clock, CheckCircle, Package, User, Phone, MapPin, Store, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCommandes() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const commandes = await prisma.commande.findMany({
    where: { statut: { not: "ANNULE" } },
    include: {
      vendeur: true,
      acheteur: true,
      items: { include: { produit: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") return `${prix.toFixed(2)} $`;
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const enAttente = commandes.filter((c) => c.statut === "EN_ATTENTE");
  const validees = commandes.filter((c) => c.statut === "PAYE" || c.statut === "PRET");
  const terminees = commandes.filter((c) => c.statut === "RETIRE");

  const renderCard = (c: typeof commandes[0], couleur: string) => {
    // ✅ CORRIGÉ : produit peut être null
    const devise = c.items[0]?.produit?.devise || "FC";
    return (
      <div key={c.id} style={{
        backgroundColor: "white",
        borderRadius: "14px",
        padding: "10px 11px",
        border: "1px solid #D4C5A0",
        boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
        borderLeft: `3px solid ${couleur}`,
        marginBottom: "6px",
      }}>
        {/* En-tête compact */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", gap: "6px" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: "9px",
              color: "#94A3B8",
              fontWeight: "800",
              marginBottom: "2px",
              letterSpacing: "0.2px",
            }}>
              #{c.id.slice(0, 8)}
            </p>
            <p style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "2px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              <User size={11} strokeWidth={2.8} />
              {c.nomClient || c.acheteur?.nom || "Client"}
            </p>
            <p style={{
              fontSize: "10px",
              color: "#57534E",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
              <Phone size={10} strokeWidth={2.8} />
              {c.telephoneClient || c.acheteur?.telephone || "—"}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{
              fontSize: "13px",
              fontWeight: "900",
              color: "#EA580C",
              letterSpacing: "-0.2px",
            }}>
              {formaterPrix(c.total, devise)}
            </p>
            <p style={{
              fontSize: "9px",
              color: "#57534E",
              marginTop: "3px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "3px",
            }}>
              {c.mode === "LIVRAISON" ? (
                <>
                  <Truck size={9} strokeWidth={2.8} />
                  Livraison
                </>
              ) : (
                <>
                  <Store size={9} strokeWidth={2.8} />
                  Retrait
                </>
              )}
            </p>
          </div>
        </div>

        <p style={{
          fontSize: "10.5px",
          color: "#0F172A",
          fontWeight: "900",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          <Store size={11} strokeWidth={2.8} />
          {c.vendeur.nomBoutique}
        </p>

        {c.mode === "LIVRAISON" && c.adresse && (
          <p style={{
            fontSize: "10px",
            color: "#57534E",
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "700",
          }}>
            <MapPin size={10} strokeWidth={2.8} />
            {c.adresse}
          </p>
        )}

        <div style={{
          backgroundColor: "#F5EAD2",
          borderRadius: "10px",
          padding: "6px 8px",
          border: "1px solid #D4C5A0",
        }}>
          {c.items.map((i, idx) => (
            <div key={idx} style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10.5px",
              marginBottom: idx < c.items.length - 1 ? "3px" : "0",
              gap: "6px",
            }}>
              <span style={{
                color: "#0F172A",
                fontWeight: "800",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                flex: 1,
              }}>
                {/* ✅ CORRIGÉ : produit peut être null, on utilise nomProduit en fallback */}
                {i.produit?.nom || i.nomProduit || "Produit supprimé"} × {i.quantite}
              </span>
              <span style={{ color: "#57534E", fontWeight: "800", flexShrink: 0 }}>
                {formaterPrix(i.prixUnitaire * i.quantite, devise)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const titreSection = (couleur: string) => ({
    fontSize: "11.5px",
    fontWeight: "900" as const,
    color: couleur,
    marginBottom: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "6px",
  });

  const traitCouleur = (couleur: string) => ({
    display: "inline-block",
    width: "3px",
    height: "12px",
    backgroundColor: couleur,
    borderRadius: "2px",
  });

  return (
    <div style={{ backgroundColor: "#F5EAD2", minHeight: "100vh", padding: "16px 12px 90px 12px" }}>
      <h1 style={{
        fontSize: "22px",
        fontWeight: "900",
        color: "#0F172A",
        marginBottom: "3px",
        letterSpacing: "-0.4px",
      }}>
        Commandes
      </h1>
      <p style={{ fontSize: "11.5px", color: "#57534E", fontWeight: "700", marginBottom: "16px" }}>
        Toutes les commandes du complexe
      </p>

      {/* STATS COMPACTES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "6px",
        marginBottom: "16px",
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 6px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <Clock size={14} color="#B45309" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{
            fontSize: "9px",
            color: "#57534E",
            fontWeight: "900",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}>
            En attente
          </p>
          <p style={{ fontSize: "18px", fontWeight: "900", color: "#B45309", lineHeight: 1 }}>
            {enAttente.length}
          </p>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 6px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <CheckCircle size={14} color="#1D4ED8" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{
            fontSize: "9px",
            color: "#57534E",
            fontWeight: "900",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}>
            Validées
          </p>
          <p style={{ fontSize: "18px", fontWeight: "900", color: "#1D4ED8", lineHeight: 1 }}>
            {validees.length}
          </p>
        </div>
        <div style={{
          backgroundColor: "white",
          borderRadius: "14px",
          padding: "10px 6px",
          border: "1px solid #D4C5A0",
          textAlign: "center",
        }}>
          <Package size={14} color="#16A34A" strokeWidth={2.8} style={{ marginBottom: "4px" }} />
          <p style={{
            fontSize: "9px",
            color: "#57534E",
            fontWeight: "900",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}>
            Terminées
          </p>
          <p style={{ fontSize: "18px", fontWeight: "900", color: "#16A34A", lineHeight: 1 }}>
            {terminees.length}
          </p>
        </div>
      </div>

      {commandes.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          textAlign: "center",
          padding: "40px 20px",
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
            <Package size={26} color="#EA580C" strokeWidth={2} />
          </div>
          <p style={{ fontSize: "13px", fontWeight: "900", marginBottom: "6px", color: "#0F172A" }}>
            Aucune commande
          </p>
          <p style={{ color: "#57534E", fontSize: "11px", fontWeight: "700" }}>
            Les commandes apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {enAttente.length > 0 && (
            <>
              <h2 style={titreSection("#B45309")}>
                <span style={traitCouleur("#B45309")} />
                En attente ({enAttente.length})
              </h2>
              <div style={{ marginBottom: "16px" }}>
                {enAttente.map((c) => renderCard(c, "#B45309"))}
              </div>
            </>
          )}

          {validees.length > 0 && (
            <>
              <h2 style={titreSection("#1D4ED8")}>
                <span style={traitCouleur("#1D4ED8")} />
                Validées ({validees.length})
              </h2>
              <div style={{ marginBottom: "16px" }}>
                {validees.map((c) => renderCard(c, "#1D4ED8"))}
              </div>
            </>
          )}

          {terminees.length > 0 && (
            <>
              <h2 style={titreSection("#16A34A")}>
                <span style={traitCouleur("#16A34A")} />
                Terminées ({terminees.length})
              </h2>
              <div>
                {terminees.map((c) => renderCard(c, "#16A34A"))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
        }
