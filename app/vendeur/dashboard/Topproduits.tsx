import { Trophy, Package } from "lucide-react";

interface TopProduit {
  id: string;
  nom: string;
  photo: string | null;
  quantiteVendue: number;
  chiffreAffaires: number;
  devise: string;
}

interface TopProduitsProps {
  produits: TopProduit[];
}

export default function TopProduits({ produits }: TopProduitsProps) {
  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") return `${prix.toFixed(2)} $`;
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  if (produits.length === 0) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "12px",
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
        border: "1px solid #F1F5F9",
        textAlign: "center",
      }}>
        <Trophy size={28} color="#94a3b8" strokeWidth={1.5} style={{ marginBottom: "6px" }} />
        <p style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "3px" }}>
          Aucune vente encore
        </p>
        <p style={{ fontSize: "10.5px", color: "#64748b", fontWeight: "500" }}>
          Vos meilleurs produits apparaîtront ici automatiquement.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "12px",
      boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
      border: "1px solid #F1F5F9",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
        <Trophy size={16} color="#F59E0B" strokeWidth={2.5} />
        <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>
          Produits les plus vendus
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {produits.map((p, index) => {
          const rang = index + 1;
          const couleurRang =
            rang === 1 ? "#F59E0B" : rang === 2 ? "#94A3B8" : rang === 3 ? "#B45309" : "#CBD5E1";

          return (
            <div key={p.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px",
              backgroundColor: "#F8FAFC",
              borderRadius: "10px",
            }}>
              {/* Rang */}
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: couleurRang,
                color: "white",
                fontSize: "11px",
                fontWeight: "900",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                {rang}
              </div>

              {/* Photo */}
              {p.photo ? (
                <img
                  src={p.photo}
                  alt={p.nom}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Package size={18} color="#64748b" strokeWidth={2} />
                </div>
              )}

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "#0F172A",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "2px",
                }}>
                  {p.nom}
                </p>
                <p style={{
                  fontSize: "10.5px",
                  color: "#64748b",
                  fontWeight: "700",
                }}>
                  {p.quantiteVendue} vendu{p.quantiteVendue > 1 ? "s" : ""}
                </p>
              </div>

              {/* CA */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{
                  fontSize: "12px",
                  fontWeight: "900",
                  color: "#16a34a",
                  lineHeight: 1.1,
                }}>
                  {formaterPrix(p.chiffreAffaires, p.devise)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{
        fontSize: "9.5px",
        color: "#94a3b8",
        fontWeight: "600",
        marginTop: "10px",
        textAlign: "center",
        fontStyle: "italic",
      }}>
        Calculé automatiquement selon vos ventes
      </p>
    </div>
  );
                    }
