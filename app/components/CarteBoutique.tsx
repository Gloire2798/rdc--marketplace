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
        display: "flex",
        backgroundColor: "white",
        borderRadius: "14px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        border: "1.5px solid #0F172A",
        boxShadow: "3px 3px 0 #F59E0B",
        marginBottom: "12px",
        minHeight: "110px",
      }}
    >
      {/* PHOTO À GAUCHE */}
      <div style={{
        width: "110px",
        flexShrink: 0,
        backgroundColor: "#F1F5F9",
        overflow: "hidden",
      }}>
        {photo ? (
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
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <LogoBoutique nom={boutique.nomBoutique} taille={48} />
          </div>
        )}
      </div>

      {/* SÉPARATION */}
      <div style={{ width: "1.5px", backgroundColor: "#0F172A", flexShrink: 0 }} />

      {/* INFOS À DROITE */}
      <div style={{
        flex: 1,
        minWidth: 0,
        padding: "12px 12px",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
          <LogoBoutique nom={boutique.nomBoutique} taille={24} />
          <h3 style={{
            fontSize: "14px",
            fontWeight: "900",
            color: "#0F172A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "-0.2px",
          }}>
            {boutique.nomBoutique}
          </h3>
        </div>

        {boutique.adresse && (
          <p style={{
            fontSize: "10.5px",
            color: "#EA580C",
            fontWeight: "700",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "4px",
          }}>
            📍 {boutique.adresse}
          </p>
        )}

        {boutique.description && (
          <p style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: "600",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.35,
            marginBottom: "8px",
          }}>
            {boutique.description}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
          <span style={{
            backgroundColor: "#0F172A",
            color: "white",
            fontSize: "10px",
            fontWeight: "900",
            padding: "5px 12px",
            borderRadius: "20px",
            letterSpacing: "0.3px",
          }}>
            Voir →
          </span>
        </div>
      </div>
    </Link>
  );
      }
