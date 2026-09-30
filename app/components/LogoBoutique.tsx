interface LogoBoutiqueProps {
  nom: string;
  taille?: number;
}

const categories = [
  {
    mots: ["fashion", "mode", "vêtement", "vetement", "habit", "style", "couture"],
    icone: "👗",
    bg: "#FCE7F3",
    couleur: "#9D174D",
  },
  {
    mots: ["fruit", "alimentation", "food", "manger", "épicerie", "epicerie", "légume", "legume", "fresh"],
    icone: "🍊",
    bg: "#FEF3C7",
    couleur: "#92400E",
  },
  {
    mots: ["tech", "électro", "electro", "phone", "informatique", "digital", "gadget"],
    icone: "📱",
    bg: "#DBEAFE",
    couleur: "#1E40AF",
  },
  {
    mots: ["beauté", "beaute", "cosmétique", "cosmetique", "soin", "parfum"],
    icone: "💄",
    bg: "#FCE7F3",
    couleur: "#BE185D",
  },
  {
    mots: ["maison", "déco", "deco", "meuble", "ameublement", "intérieur", "interieur"],
    icone: "🛋️",
    bg: "#FEF3C7",
    couleur: "#78350F",
  },
  {
    mots: ["sport", "fitness", "gym", "football", "basket"],
    icone: "⚽",
    bg: "#DCFCE7",
    couleur: "#166534",
  },
  {
    mots: ["pharma", "médic", "medic", "santé", "sante", "clinique"],
    icone: "💊",
    bg: "#DBEAFE",
    couleur: "#0369A1",
  },
  {
    mots: ["livre", "book", "librairie", "papeterie", "école", "ecole"],
    icone: "📚",
    bg: "#EDE9FE",
    couleur: "#6D28D9",
  },
  {
    mots: ["montre", "bijou", "accessoire", "sac", "chaussure", "basket"],
    icone: "👞",
    bg: "#FED7AA",
    couleur: "#9A3412",
  },
  {
    mots: ["enfant", "bébé", "bebe", "jouet", "kids"],
    icone: "🧸",
    bg: "#FCE7F3",
    couleur: "#BE185D",
  },
];

export default function LogoBoutique({ nom, taille = 50 }: LogoBoutiqueProps) {
  const nomLower = nom.toLowerCase();

  const categorie = categories.find((cat) =>
    cat.mots.some((mot) => nomLower.includes(mot))
  ) || {
    icone: "🏪",
    bg: "#DBEAFE",
    couleur: "#1E40AF",
  };

  return (
    <div style={{
      width: `${taille}px`,
      height: `${taille}px`,
      borderRadius: "50%",
      backgroundColor: categorie.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: `${taille * 0.45}px`,
      flexShrink: 0,
      border: `2px solid ${categorie.couleur}22`,
    }}>
      {categorie.icone}
    </div>
  );
  }
