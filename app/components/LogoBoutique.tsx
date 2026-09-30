interface LogoBoutiqueProps {
  nom: string;
  taille?: number;
}

const categories = [
  {
    mots: ["fashion", "mode", "vêtement", "vetement", "habit", "style", "couture", "nzam"],
    icone: "👗",
    bg: "#FCE7F3",
    bordure: "#EC4899",
    couleur: "#831843",
  },
  {
    mots: ["fruit", "alimentation", "food", "manger", "épicerie", "epicerie", "légume", "legume", "fresh"],
    icone: "🍊",
    bg: "#FEF3C7",
    bordure: "#F59E0B",
    couleur: "#78350F",
  },
  {
    mots: ["tech", "électro", "electro", "phone", "informatique", "digital", "gadget", "sensei"],
    icone: "📱",
    bg: "#0F172A",
    bordure: "#1E3A5F",
    couleur: "#FFFFFF",
  },
  {
    mots: ["beauté", "beaute", "cosmétique", "cosmetique", "soin", "parfum"],
    icone: "💄",
    bg: "#FCE7F3",
    bordure: "#EC4899",
    couleur: "#831843",
  },
  {
    mots: ["maison", "déco", "deco", "meuble", "ameublement", "intérieur", "interieur"],
    icone: "🛋️",
    bg: "#FEF3C7",
    bordure: "#D97706",
    couleur: "#78350F",
  },
  {
    mots: ["sport", "fitness", "gym", "football", "basket"],
    icone: "⚽",
    bg: "#DCFCE7",
    bordure: "#16A34A",
    couleur: "#14532D",
  },
  {
    mots: ["pharma", "médic", "medic", "santé", "sante", "clinique"],
    icone: "💊",
    bg: "#DBEAFE",
    bordure: "#2563EB",
    couleur: "#1E3A8A",
  },
  {
    mots: ["livre", "book", "librairie", "papeterie", "école", "ecole"],
    icone: "📚",
    bg: "#EDE9FE",
    bordure: "#7C3AED",
    couleur: "#4C1D95",
  },
  {
    mots: ["montre", "bijou", "accessoire", "sac", "chaussure"],
    icone: "👜",
    bg: "#FED7AA",
    bordure: "#EA580C",
    couleur: "#7C2D12",
  },
  {
    mots: ["enfant", "bébé", "bebe", "jouet", "kids"],
    icone: "🧸",
    bg: "#FCE7F3",
    bordure: "#DB2777",
    couleur: "#831843",
  },
  {
    mots: ["gemy"],
    icone: "🏪",
    bg: "#DBEAFE",
    bordure: "#2563EB",
    couleur: "#1E3A8A",
  },
];

export default function LogoBoutique({ nom, taille = 50 }: LogoBoutiqueProps) {
  const nomLower = nom.toLowerCase();

  const categorie = categories.find((cat) =>
    cat.mots.some((mot) => nomLower.includes(mot))
  ) || {
    icone: "🏪",
    bg: "#DBEAFE",
    bordure: "#2563EB",
    couleur: "#1E3A8A",
  };

  const nomCourt = nom.length > 12 ? nom.slice(0, 10) + "…" : nom;

  return (
    <div style={{
      width: `${taille}px`,
      height: `${taille}px`,
      borderRadius: "50%",
      backgroundColor: categorie.bg,
      border: `2px solid ${categorie.bordure}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      padding: "2px",
      boxSizing: "border-box",
    }}>
      <span style={{
        fontSize: `${taille * 0.35}px`,
        lineHeight: 1,
      }}>
        {categorie.icone}
      </span>
      <span style={{
        fontSize: `${taille * 0.15}px`,
        fontWeight: "800",
        color: categorie.couleur,
        lineHeight: 1,
        marginTop: "1px",
        textAlign: "center",
        overflow: "hidden",
        maxWidth: "100%",
      }}>
        {nomCourt}
      </span>
    </div>
  );
}
