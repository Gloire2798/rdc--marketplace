import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, Store, Phone, MapPin, User } from "lucide-react";

export default async function UtilisateursAdmin() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const clients = await prisma.user.findMany({
    where: {
      role: "ACHETEUR",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const vendeurs = await prisma.vendeur.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const titreSection = (couleur: string) => ({
    fontSize: "12px",
    fontWeight: "900" as const,
    color: "#0F172A",
    textTransform: "uppercase" as const,
    letterSpacing: "0.6px",
    marginBottom: "12px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  });

  const traitCouleur = (couleur: string) => ({
    display: "inline-block",
    width: "3px",
    height: "13px",
    backgroundColor: couleur,
    borderRadius: "2px",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5EAD2",
        padding: "16px 12px 90px",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "3px",
            letterSpacing: "-0.4px",
          }}
        >
          Utilisateurs
        </h1>

        <p
          style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
          }}
        >
          Clients et vendeurs inscrits sur GK Sensei
        </p>
      </div>

      {/* CLIENTS */}
      <section style={{ marginBottom: "24px" }}>
        <h2 style={titreSection("#1D4ED8")}>
          <span style={traitCouleur("#1D4ED8")} />
          <Users size={14} strokeWidth={2.8} color="#1D4ED8" />
          Clients ({clients.length})
        </h2>

        {clients.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "40px 20px",
              textAlign: "center",
              border: "1.5px solid #0F172A",
              boxShadow: "4px 4px 0 #EA580C",
            }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#F5EAD2",
              marginBottom: "10px",
            }}>
              <Users size={26} color="#EA580C" strokeWidth={2} />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#57534E",
                fontWeight: "800",
              }}
            >
              Aucun client enregistré.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {clients.map((client) => (
              <div
                key={client.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "12px",
                  border: "1px solid #D4C5A0",
                  boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "16px",
                  fontWeight: "900",
                  color: "white",
                }}>
                  {(client.nom || "?").trim().charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13.5px",
                      fontWeight: "900",
                      color: "#0F172A",
                      marginBottom: "3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {client.nom || "Nom non renseigné"}
                  </p>

                  <p
                    style={{
                      fontSize: "11px",
                      color: "#57534E",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <Phone size={11} strokeWidth={2.8} />
                    {client.telephone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VENDEURS */}
      <section>
        <h2 style={titreSection("#16A34A")}>
          <span style={traitCouleur("#16A34A")} />
          <Store size={14} strokeWidth={2.8} color="#16A34A" />
          Vendeurs ({vendeurs.length})
        </h2>

        {vendeurs.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "40px 20px",
              textAlign: "center",
              border: "1.5px solid #0F172A",
              boxShadow: "4px 4px 0 #EA580C",
            }}
          >
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#F5EAD2",
              marginBottom: "10px",
            }}>
              <Store size={26} color="#EA580C" strokeWidth={2} />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#57534E",
                fontWeight: "800",
              }}
            >
              Aucun vendeur enregistré.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {vendeurs.map((vendeur) => (
              <div
                key={vendeur.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "12px",
                  border: "1px solid #D4C5A0",
                  boxShadow: "0 2px 6px rgba(120, 100, 60, 0.06)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "16px",
                  fontWeight: "900",
                  color: "white",
                }}>
                  {(vendeur.nomBoutique || "?").trim().charAt(0).toUpperCase()}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13.5px",
                      fontWeight: "900",
                      color: "#0F172A",
                      marginBottom: "3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {vendeur.user.nom || "Nom non renseigné"}
                  </p>

                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "900",
                      color: "#EA580C",
                      marginBottom: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Store size={11} strokeWidth={2.8} />
                    {vendeur.nomBoutique}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#57534E",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Phone size={11} strokeWidth={2.8} />
                      {vendeur.telephone}
                    </p>

                    {vendeur.adresse && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#57534E",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <MapPin size={11} strokeWidth={2.8} />
                        {vendeur.adresse}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
                }
