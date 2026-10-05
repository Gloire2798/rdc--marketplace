import { MessageCircle, Construction, Mail, Ticket, Phone, HelpCircle } from "lucide-react";

export default function SupportPage() {
  const listeStyle = {
    fontSize: "11.5px",
    color: "#0F172A",
    fontWeight: "700",
    lineHeight: 1.8,
    paddingLeft: "0",
    listStyle: "none",
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "6px",
  };

  const itemStyle = {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5EAD2",
        padding: "16px 12px 90px",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "18px" }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "900",
            color: "#0F172A",
            letterSpacing: "-0.4px",
            marginBottom: "3px",
          }}
        >
          Support
        </h1>
        <p
          style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
          }}
        >
          Aide et assistance
        </p>
      </div>

      {/* Message central */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "40px 20px",
          border: "1.5px solid #0F172A",
          boxShadow: "4px 4px 0 #EA580C",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
          }}
        >
          <Construction size={30} color="#EA580C" strokeWidth={2.2} />
        </div>

        <p
          style={{
            fontSize: "15px",
            fontWeight: "900",
            color: "#0F172A",
            marginBottom: "6px",
            letterSpacing: "-0.2px",
          }}
        >
          Page en construction
        </p>

        <p
          style={{
            fontSize: "11.5px",
            color: "#57534E",
            fontWeight: "700",
            lineHeight: 1.5,
            marginBottom: "20px",
          }}
        >
          Cet espace accueillera bientôt :
        </p>

        <div
          style={{
            backgroundColor: "#F5EAD2",
            border: "1px solid #D4C5A0",
            borderRadius: "14px",
            padding: "14px",
            textAlign: "left",
          }}
        >
          <ul style={listeStyle}>
            <li style={itemStyle}>
              <Mail size={13} strokeWidth={2.8} color="#EA580C" />
              Les messages reçus des vendeurs et clients
            </li>
            <li style={itemStyle}>
              <Ticket size={13} strokeWidth={2.8} color="#EA580C" />
              La gestion des tickets d&apos;assistance
            </li>
            <li style={itemStyle}>
              <Phone size={13} strokeWidth={2.8} color="#EA580C" />
              Un contact WhatsApp direct
            </li>
            <li style={itemStyle}>
              <HelpCircle size={13} strokeWidth={2.8} color="#EA580C" />
              Une FAQ pour les questions fréquentes
            </li>
          </ul>
        </div>
      </div>

      {/* Contact rapide */}
      <div
        style={{
          backgroundColor: "white",
          border: "1.5px solid #0F172A",
          borderRadius: "16px",
          padding: "14px",
          marginTop: "14px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "3px 3px 0 #16A34A",
        }}
      >
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          backgroundColor: "#DCFCE7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <MessageCircle size={20} color="#16A34A" strokeWidth={2.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: "3px",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            En attendant
          </p>
          <p
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#57534E",
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
