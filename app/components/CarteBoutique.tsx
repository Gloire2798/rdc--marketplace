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

const coinStyle = {
  position: "absolute" as const,
  width: "22px",
  height: "22px",
  background: "repeating-linear-gradient(45deg, #F97316 0px, #F97316 3px, #FBBF24 3px, #FBBF24 6px, #1E3A5F 6px, #1E3A5F 9px)",
};

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
        border: "1px solid #E8DFC8",
        boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
        marginBottom: "12px",
        position: "relative",
      }}
    >
      {/* Coins pagne en haut */}
      <div style={{ ...coinStyle, top: 0, left: 0, borderBottomRightRadius: "50%", zIndex: 3 }} />
      <div style={{ ...coinStyle, top: 0, right: 0, borderBottomLeftRadius: "50%", zIndex: 3 }} />

      {/* Photo de couverture bien cadrée */}
      {photo ? (
        <div style={{
          width: "100%",
          height: "150px",
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
          height: "110px",
          background: "linear-gradient(135deg, #FAF5E8 0%, #E8DFC8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          <LogoBoutique nom={boutique.nomBoutique} taille={60} />
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
                color: "#78716C",
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
            color: "#57534E",
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

      {/* Coins pagne en bas */}
      <div style={{ ...coinStyle, bottom: 0, left: 0, borderTopRightRadius: "50%", zIndex: 3 }} />
      <div style={{ ...coinStyle, bottom: 0, right: 0, borderTopLeftRadius: "50%", zIndex: 3 }} />
    </Link>
  );
}
