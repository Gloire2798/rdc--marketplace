import { MessageCircle, Construction } from "lucide-react";

export default function SupportPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        padding: "16px 12px 90px",
      }}
    >
      {/* En-tête */}
      <div style={{ marginBottom: "16px" }}>
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0F172A",
          }}
        >
          Support
        </h1>
        <p
          style={{
            fontSize: "11px",
            color: "#64748B",
            fontWeight: "600",
            marginTop: "3px",
          }}
        >
          Aide et assistance
        </p>
      </div>

      {/* Message central */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px 20px",
          border: "1px solid #E2E8F0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#DBEAFE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
          }}
        >
          <Construction size={28} color="#1D4ED8" strokeWidth={2.5} />
        </div>

        <p
          style={{
            fontSize: "15px",
            fontWeight: "800",
            color: "#0F172A",
            marginBottom: "6px",
          }}
        >
          Page en construction
        </p>

        <p
          style={{
            fontSize: "11.5px",
            color: "#64748B",
            fontWeight: "600",
            lineHeight: 1.5,
            marginBottom: "20px",
          }}
        >
          Cet espace accueillera bientôt :
        </p>

        <div
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            padding: "14px",
            textAlign: "left",
          }}
        >
          <ul
            style={{
              fontSize: "11.5px",
              color: "#475569",
              fontWeight: "600",
              lineHeight: 1.8,
              paddingLeft: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <li>📩 Les messages reçus des vendeurs et clients</li>
            <li>🎫 La gestion des tickets d&apos;assistance</li>
            <li>📞 Un contact WhatsApp direct</li>
            <li>❓ Une FAQ pour les questions fréquentes</li>
          </ul>
        </div>
      </div>

      {/* Contact rapide */}
      <div
        style={{
          backgroundColor: "#FEF3C7",
          border: "1px solid #FDE68A",
          borderRadius: "12px",
          padding: "14px",
          marginTop: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <MessageCircle size={20} color="#B45309" strokeWidth={2.5} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "11.5px",
              fontWeight: "800",
              color: "#78350F",
              marginBottom: "2px",
            }}
          >
            En attendant
          </p>
          <p
            style={{
              fontSize: "10.5px",
              fontWeight: "600",
              color: "#78350F",
              lineHeight: 1.4,
            }}
          >
            Pour toute demande urgente, contactez directement sur WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
          }
