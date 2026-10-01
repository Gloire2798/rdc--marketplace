import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, Store, Phone, MapPin } from "lucide-react";

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

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        padding: "16px 12px 90px",
      }}
    >
      <div style={{ marginBottom: "18px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0F172A",
          }}
        >
          Utilisateurs
        </h1>

        <p
          style={{
            fontSize: "11px",
            color: "#64748B",
            fontWeight: "600",
            marginTop: "3px",
          }}
        >
          Clients et vendeurs inscrits sur GK Sensei
        </p>
      </div>

      {/* CLIENTS */}
      <section style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <Users size={18} color="#1D4ED8" />

          <h2
            style={{
              fontSize: "15px",
              fontWeight: "800",
              color: "#0F172A",
            }}
          >
            Clients ({clients.length})
          </h2>
        </div>

        {clients.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "25px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                fontWeight: "600",
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
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0F172A",
                    marginBottom: "7px",
                  }}
                >
                  {client.nom || "Nom non renseigné"}
                </p>

                <p
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Phone size={12} />
                  {client.telephone}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VENDEURS */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <Store size={18} color="#15803D" />

          <h2
            style={{
              fontSize: "15px",
              fontWeight: "800",
              color: "#0F172A",
            }}
          >
            Vendeurs ({vendeurs.length})
          </h2>
        </div>

        {vendeurs.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "25px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#64748B",
                fontWeight: "600",
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
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0F172A",
                    marginBottom: "3px",
                  }}
                >
                  {vendeur.user.nom || "Nom non renseigné"}
                </p>

                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#1D4ED8",
                    marginBottom: "8px",
                  }}
                >
                  {vendeur.nomBoutique}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#475569",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Phone size={12} />
                    {vendeur.telephone}
                  </p>

                  {vendeur.adresse && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#475569",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MapPin size={12} />
                      {vendeur.adresse}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
        }
