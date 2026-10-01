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
        borderRadius: "12px",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        border: "1px solid #E8DFC8",
        boxShadow: "0 1px 4px rgba(120, 100, 60, 0.06)",
        marginBottom: "10px",
        minHeight: "110px",
      }}
    >
      {/* PHOTO À GAUCHE */}
      <div style={{
        width: "110px",
        height: "110px",
        flexShrink: 0,
        backgroundColor: "#F1F5F9",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            background: "linear-gradient(135deg, #FAF5E8 0%, #E8DFC8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <LogoBoutique nom={boutique.nomBoutique} taille={48} />
          </div>
        )}
      </div>

      {/* SÉPARATION VERTICALE */}
      <div style={{
        width: "1px",
        backgroundColor: "#E8DFC8",
        flexShrink: 0,
      }} />

      {/* INFOS À DROITE */}
      <div style={{
        flex: 1,
        minWidth: 0,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <LogoBoutique nom={boutique.nomBoutique} taille={24} />
            <h3 style={{
              fontSize: "13px",
              fontWeight: "800",
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {boutique.nomBoutique}
            </h3>
          </div>

          {boutique.adresse && (
            <p style={{
              fontSize: "10px",
              color: "#78716C",
              fontWeight: "600",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: "3px",
            }}>
              📍 {boutique.adresse}
            </p>
          )}

          {boutique.description && (
            <p style={{
              fontSize: "10.5px",
              color: "#57534E",
              fontWeight: "500",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.3,
            }}>
              {boutique.description}
            </p>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
          <span style={{
            backgroundColor: "#0F172A",
            color: "white",
            fontSize: "10px",
            fontWeight: "800",
            padding: "5px 11px",
            borderRadius: "20px",
          }}>
            Voir →
          </span>
        </div>
      </div>
    </Link>
  );
      }
