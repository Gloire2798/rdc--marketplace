import Link from "next/link";
import LogoBoutique from "./LogoBoutique";

interface Boutique {
  id: string;
  nomBoutique: string;
  description: string | null;
  adresse: string | null;
  photoCouverture: string | null;
  photo2: string | null;
  photo3: string | null;
  nombreProduits: number;
}

export default function CarteBoutique({ boutique }: { boutique: Boutique }) {
  const photo = boutique.photoCouverture || boutique.photo2 || boutique.photo3;

  return (
    <Link
      href={`/acheteur/boutique/${boutique.id}`}
      style={{
        display: "block",
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        border: "1px solid #F1F5F9",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
        marginBottom: "12px",
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={boutique.nomBoutique}
          style={{
            width: "100%",
            height: "150px",
            objectFit: "cover",
            display: "block",
            backgroundColor: "#F8FAFC",
          }}
        />
      ) : (
        <div style={{
          width: "100%",
          height: "100px",
          background: "linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <LogoBoutique nom={boutique.nomBoutique} taille={64} />
        </div>
      )}

      <div style={{ padding: "10px 12px 12px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <LogoBoutique nom={boutique.nomBoutique} taille={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "900",
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {boutique.nomBoutique}
            </h3>
            {boutique.adresse && (
              <p style={{
                fontSize: "10.5px",
                color: "#64748b",
                fontWeight: "600",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                📍 {boutique.adresse}
              </p>
            )}
          </div>
        </div>

        {boutique.description && (
          <p style={{
            fontSize: "11.5px",
            color: "#475569",
            fontWeight: "500",
            marginBottom: "10px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.35,
          }}>
            {boutique.description}
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontSize: "10.5px",
            color: "#64748b",
            fontWeight: "700",
          }}>
            📦 {boutique.nombreProduits} produit{boutique.nombreProduits > 1 ? "s" : ""}
          </span>

          <span style={{
            backgroundColor: "#0F172A",
            color: "white",
            fontSize: "11px",
            fontWeight: "800",
            padding: "6px 12px",
            borderRadius: "20px",
          }}>
            Voir →
          </span>
        </div>
      </div>
    </Link>
  );
          }
