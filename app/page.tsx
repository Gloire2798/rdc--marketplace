const boutiques = [
  { id: 1, nom: "Boutique Mode Kin", description: "Vêtements et accessoires", emoji: "👕" },
  { id: 2, nom: "Tech Électronique", description: "Téléphones et gadgets", emoji: "📱" },
  { id: 3, nom: "Alimentation Fresh", description: "Produits alimentaires", emoji: "🥬" },
  { id: 4, nom: "Beauté & Soins", description: "Cosmétiques et soins", emoji: "💄" },
  { id: 5, nom: "Maison & Déco", description: "Meubles et décoration", emoji: "🛋️" },
];

export default function Home() {
  return (
    <div className="container" style={{ padding: "40px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "12px" }}>
          Bienvenue sur GK Sensei
        </h1>
        <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "8px" }}>
          Complexe Commercial
        </p>
        <p style={{ fontSize: "16px", color: "#9ca3af", fontStyle: "italic" }}>
          "Toutes vos boutiques préférées, en un seul endroit."
        </p>
      </div>

      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
        Nos boutiques
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
      }}>
        {boutiques.map((boutique) => (
          <a
            key={boutique.id}
            href={`/acheteur/boutique/${boutique.id}`}
            className="card"
            style={{ display: "block", cursor: "pointer" }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
              {boutique.emoji}
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
              {boutique.nom}
            </h3>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              {boutique.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
