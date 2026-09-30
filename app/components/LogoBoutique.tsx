import {
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Sofa,
  Dumbbell,
  Pill,
  BookOpen,
  Gem,
  Baby,
  Store,
  type LucideIcon,
} from "lucide-react";

interface LogoBoutiqueProps {
  nom: string;
  taille?: number;
}

interface Categorie {
  mots: string[];
  Icon: LucideIcon;
  bg: string;
  bordure: string;
  couleur: string;
}

const categories: Categorie[] = [
  {
    mots: ["fashion", "mode", "vêtement", "vetement", "habit", "style", "couture", "nzam"],
    Icon: Shirt,
    bg: "#FCE7F3",
    bordure: "#EC4899",
    couleur: "#831843",
  },
  {
    mots: ["fruit", "alimentation", "food", "manger", "épicerie", "epicerie", "légume", "legume", "fresh"],
    Icon: ShoppingBasket,
    bg: "#FEF3C7",
    bordure: "#F59E0B",
    couleur: "#78350F",
  },
  {
    mots: ["tech", "électro", "electro", "phone", "informatique", "digital", "gadget", "sensei"],
    Icon: Smartphone,
    bg: "#DBEAFE",
    bordure: "#2563EB",
    couleur: "#1E3A8A",
  },
  {
    mots: ["beauté", "beaute", "cosmétique", "cosmetique", "soin", "parfum"],
    Icon: Sparkles,
    bg: "#FCE7F3",
    bordure: "#EC4899",
    couleur: "#831843",
  },
  {
    mots: ["maison", "déco", "deco", "meuble", "ameublement", "intérieur", "interieur"],
    Icon: Sofa,
    bg: "#FEF3C7",
    bordure: "#D97706",
    couleur: "#78350F",
  },
  {
    mots: ["sport", "fitness", "gym", "football", "basket"],
    Icon: Dumbbell,
    bg: "#DCFCE7",
    bordure: "#16A34A",
    couleur: "#14532D",
  },
  {
    mots: ["pharma", "médic", "medic", "santé", "sante", "clinique"],
    Icon: Pill,
    bg: "#DBEAFE",
    bordure: "#2563EB",
    couleur: "#1E3A8A",
  },
  {
    mots: ["livre", "book", "librairie", "papeterie", "école", "ecole"],
    Icon: BookOpen,
    bg: "#EDE9FE",
    bordure: "#7C3AED",
    couleur: "#4C1D95",
  },
  {
    mots: ["montre", "bijou", "accessoire", "sac", "chaussure"],
    Icon: Gem,
    bg: "#FED7AA",
    bordure: "#EA580C",
    couleur: "#7C2D12",
  },
  {
    mots: ["enfant", "bébé", "bebe", "jouet", "kids"],
    Icon: Baby,
    bg: "#FCE7F3",
    bordure: "#DB2777",
    couleur: "#831843",
  },
];

export default function LogoBoutique({ nom, taille = 50 }: LogoBoutiqueProps) {
  const nomLower = nom.toLowerCase();

  const categorie = categories.find((cat) =>
    cat.mots.some((mot) => nomLower.includes(mot))
  ) || {
    Icon: Store,
    bg: "#DBEAFE",
    bordure: "#2563EB",
    couleur: "#1E3A8A",
  };

  const Icon = categorie.Icon;

  return (
    <div style={{
      width: `${taille}px`,
      height: `${taille}px`,
      borderRadius: "50%",
      backgroundColor: categorie.bg,
      border: `2px solid ${categorie.bordure}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxSizing: "border-box",
      boxShadow: `0 2px 6px ${categorie.bordure}30`,
    }}>
      <Icon
        size={taille * 0.45}
        color={categorie.couleur}
        strokeWidth={2.2}
      />
    </div>
  );
}
