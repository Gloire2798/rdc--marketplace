import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import GaleriePhotos from "./GaleriePhotos";
import SelecteurVariantes from "./SelecteurVariantes";
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
      backgroundColor: "#F5F5F5",
      paddingBottom: "30px",
    }}>
      {/* HEADER BLANC */}
      <div style={{
        backgroundColor: "white",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid #E5E5E5",
      }}>
        <Link
          href={`/acheteur/boutique/${produit.vendeur.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "2px solid #0F172A",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} color="#0F172A" strokeWidth={2.8} />
        </Link>

        <h1 style={{
          fontSize: "18px",
          fontWeight: "900",
          color: "#0F172A",
          letterSpacing: "-0.3px",
        }}>
          Produit
        </h1>

        {/* Espace vide pour centrer le titre */}
        <div style={{ width: "36px" }} />
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
        }}>
          {/* Nom */}
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

          {/* Prix */}
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
                color: "#94A3B8",
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
              backgroundColor: "#F5F5F5",
              borderRadius: "14px",
              padding: "10px 12px",
              textDecoration: "none",
              color: "inherit",
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
                color: "#64748B",
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
            <ChevronRight size={16} color="#64748B" strokeWidth={2.5} />
          </Link>
        </div>

        {/* SELECTEUR VARIANTES */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "24px",
          padding: "18px 16px",
          marginBottom: "14px",
        }}>
          <SelecteurVariantes
            article={articleBase}
            variantes={aVariantes ? variantes : []}
            devise={produit.devise}
            prixBase={produit.prix}
            prixPromoBase={produit.prixPromo}
            stockSimple={aVariantes ? undefined : produit.stock}
          />
        </div>

        {/* DESCRIPTION */}
        {produit.description && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "18px 16px",
            marginBottom: "14px",
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
              color: "#334155",
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
