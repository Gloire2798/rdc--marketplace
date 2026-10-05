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
        borderRadius: "20px",
        padding: "24px 20px",
        marginBottom: "12px",
        boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
        border: "1px solid #D4C5A0",
        textAlign: "center",
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
          <Trophy size={26} color="#EA580C" strokeWidth={2} />
        </div>
        <p style={{ fontSize: "13px", fontWeight: "900", color: "#0F172A", marginBottom: "4px" }}>
          Aucune vente encore
        </p>
        <p style={{ fontSize: "11px", color: "#57534E", fontWeight: "600", lineHeight: 1.4 }}>
          Vos meilleurs produits apparaîtront ici automatiquement.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "20px",
      padding: "16px",
      marginBottom: "12px",
      boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
      border: "1px solid #D4C5A0",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "14px",
      }}>
        <Trophy size={18} color="#EA580C" strokeWidth={2.8} />
        <h2 style={{
          fontSize: "13px",
          fontWeight: "900",
          color: "#0F172A",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
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
              padding: "10px",
              backgroundColor: "#F5EAD2",
              borderRadius: "14px",
              border: "1px solid #D4C5A0",
            }}>
              {/* Rang */}
              <div style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: couleurRang,
                color: "white",
                fontSize: "11.5px",
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
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  flexShrink: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2px",
                  boxSizing: "border-box",
                }}>
                  <img
                    src={p.photo}
                    alt={p.nom}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Package size={20} color="#94A3B8" strokeWidth={2} />
                </div>
              )}

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "12.5px",
                  fontWeight: "900",
                  color: "#0F172A",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "3px",
                }}>
                  {p.nom}
                </p>
                <p style={{
                  fontSize: "10.5px",
                  color: "#57534E",
                  fontWeight: "800",
                }}>
                  {p.quantiteVendue} vendu{p.quantiteVendue > 1 ? "s" : ""}
                </p>
              </div>

              {/* CA */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{
                  fontSize: "13px",
                  fontWeight: "900",
                  color: "#EA580C",
                  lineHeight: 1.1,
                  letterSpacing: "-0.2px",
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
        color: "#94A3B8",
        fontWeight: "700",
        marginTop: "12px",
        textAlign: "center",
        fontStyle: "italic",
      }}>
        Calculé automatiquement selon vos ventes
      </p>
    </div>
  );
}
