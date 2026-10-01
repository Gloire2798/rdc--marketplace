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
        borderRadius: "14px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        border: "1px solid #F1F5F9",
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)",
        marginBottom: "10px",
      }}
    >
      {/* Photo de couverture bien cadrée */}
      {photo ? (
        <div style={{
          width: "100%",
          height: "140px",
          backgroundColor: "#F1F5F9",
          overflow: "hidden",
          position: "relative",
        }}>
          <img
            src={photo}
            alt={boutique.nomBoutique}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        </div>
      ) : (
        <div style={{
          width: "100%",
          height: "100px",
          background: "linear-gradient(135deg, #F5F1E8 0%, #E8DFC8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <LogoBoutique nom={boutique.nomBoutique} taille={56} />
        </div>
      )}

      <div style={{ padding: "12px 14px 14px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <LogoBoutique nom={boutique.nomBoutique} taille={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "800",
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: "2px",
            }}>
              {boutique.nomBoutique}
            </h3>
            {boutique.adresse && (
              <p style={{
                fontSize: "10.5px",
                color: "#94a3b8",
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
            lineHeight: 1.4,
          }}>
            {boutique.description}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{
            backgroundColor: "#0F172A",
            color: "white",
            fontSize: "11px",
            fontWeight: "800",
            padding: "7px 14px",
            borderRadius: "20px",
          }}>
            Voir la boutique →
          </span>
        </div>
      </div>
    </Link>
  );
            }
