import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import GaleriePhotos from "./GaleriePhotos";
import SelecteurVariantes from "./SelecteurVariantes";
import BoutonPanier from "./BoutonPanier";
import { ArrowLeft, Store, ChevronRight } from "lucide-react";

export default async function FicheProduit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const produit = await prisma.produit.findUnique({
    where: { id },
    include: {
      vendeur: true,
      variantes: true,
    },
  });

  if (!produit || !produit.actif) {
    notFound();
  }

  const photos = [produit.photo1, produit.photo2, produit.photo3].filter(
    (p): p is string => p !== null && p !== "" && p.startsWith("http")
  );

  const formaterPrix = (prix: number, devise: string) => {
    if (devise === "USD") {
      return `${prix.toFixed(2)} $`;
    }
    return `${prix.toLocaleString("fr-FR")} FC`;
  };

  const enPromo =
    produit.prixPromo !== null && produit.prixPromo < produit.prix;
  const pourcentage = enPromo
    ? Math.round(((produit.prix - produit.prixPromo!) / produit.prix) * 100)
    : 0;

  const variantes = produit.variantes.map((v) => ({
    id: v.id,
    attributs: JSON.parse(v.attributs) as Record<string, string>,
    stock: v.stock,
    prix: v.prix,
    prixPromo: v.prixPromo,
  }));

  const aVariantes = variantes.length > 0;

  const articleBase = {
    produitId: produit.id,
    vendeurId: produit.vendeurId,
    nom: produit.nom,
    prix: produit.prix,
    prixPromo: produit.prixPromo,
    devise: produit.devise,
    photo: produit.photo1,
    nomBoutique: produit.vendeur.nomBoutique,
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F5EAD2",
      paddingBottom: "30px",
    }}>
      {/* BARRE RETOUR discrète */}
      <div style={{
        backgroundColor: "white",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderBottom: "1.5px solid #D4C5A0",
      }}>
        <Link
          href={`/acheteur/boutique/${produit.vendeur.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            textDecoration: "none",
            color: "#0F172A",
            fontSize: "12px",
            fontWeight: "800",
          }}
        >
          <ArrowLeft size={16} strokeWidth={2.8} />
          Retour
        </Link>
        <p style={{
          marginLeft: "auto",
          fontSize: "11px",
          fontWeight: "700",
          color: "#57534E",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "50%",
        }}>
          {produit.vendeur.nomBoutique}
        </p>
      </div>

      {/* CONTENU */}
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "16px 14px 0 14px",
      }}>
        {/* GALERIE */}
        <div style={{ marginBottom: "18px" }}>
          <GaleriePhotos photos={photos} nomProduit={produit.nom} />
        </div>

        {/* CARTE INFOS PRINCIPALES */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "24px",
          padding: "18px 16px",
          marginBottom: "14px",
          boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "900",
            color: "#0F172A",
            lineHeight: 1.2,
            marginBottom: "10px",
            letterSpacing: "-0.4px",
          }}>
            {produit.nom}
          </h2>

          {enPromo ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "14px",
            }}>
              <span style={{
                fontSize: "26px",
                fontWeight: "900",
                color: "#EA580C",
                lineHeight: 1,
                letterSpacing: "-0.5px",
              }}>
                {formaterPrix(produit.prixPromo!, produit.devise)}
              </span>
              <span style={{
                fontSize: "14px",
                color: "#64748B",
                textDecoration: "line-through",
                fontWeight: "700",
              }}>
                {formaterPrix(produit.prix, produit.devise)}
              </span>
              <span style={{
                backgroundColor: "#0F172A",
                color: "white",
                fontSize: "10.5px",
                fontWeight: "900",
                padding: "3px 9px",
                borderRadius: "10px",
                letterSpacing: "0.2px",
              }}>
                -{pourcentage}%
              </span>
            </div>
          ) : (
            <p style={{
              fontSize: "26px",
              fontWeight: "900",
              color: "#EA580C",
              marginBottom: "14px",
              lineHeight: 1,
              letterSpacing: "-0.5px",
            }}>
              {formaterPrix(produit.prix, produit.devise)}
            </p>
          )}

          {/* CARTE VENDEUR */}
          <Link
            href={`/acheteur/boutique/${produit.vendeur.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#F5EAD2",
              borderRadius: "14px",
              padding: "10px 12px",
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #D4C5A0",
            }}
          >
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              backgroundColor: "#0F172A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Store size={14} color="white" strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "9.5px",
                color: "#57534E",
                fontWeight: "700",
                marginBottom: "1px",
              }}>
                Vendu par
              </p>
              <p style={{
                fontSize: "13px",
                fontWeight: "900",
                color: "#0F172A",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {produit.vendeur.nomBoutique}
              </p>
            </div>
            <ChevronRight size={16} color="#57534E" strokeWidth={2.5} />
          </Link>
        </div>

        {/* BLOC ACHAT : VARIANTES OU SIMPLE */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "24px",
          padding: "18px 16px",
          marginBottom: "14px",
          boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
        }}>
          {aVariantes ? (
            <SelecteurVariantes
              article={articleBase}
              variantes={variantes}
              devise={produit.devise}
              prixBase={produit.prix}
              prixPromoBase={produit.prixPromo}
            />
          ) : (
            <BoutonPanier
              article={articleBase}
              stock={produit.stock}
            />
          )}
        </div>

        {/* DESCRIPTION */}
        {produit.description && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "18px 16px",
            marginBottom: "14px",
            boxShadow: "0 2px 8px rgba(120, 100, 60, 0.08)",
          }}>
            <h3 style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "10px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                display: "inline-block",
                width: "3px",
                height: "14px",
                backgroundColor: "#EA580C",
                borderRadius: "2px",
              }} />
              Description
            </h3>
            <p style={{
              color: "#1E293B",
              fontSize: "12.5px",
              fontWeight: "500",
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
            }}>
              {produit.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
        }
