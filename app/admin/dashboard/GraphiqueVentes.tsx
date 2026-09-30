"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface VenteMois {
  mois: string;
  montant: number;
}

export default function GraphiqueVentes({ data }: { data: VenteMois[] }) {
  const [periode, setPeriode] = useState<"semaine" | "mois">("mois");

  const dataAffichee = periode === "semaine" ? data.slice(-1) : data;

  const formaterMontant = (valeur: number) => {
    if (valeur >= 1000000) return `${(valeur / 1000000).toFixed(1)}M`;
    if (valeur >= 1000) return `${(valeur / 1000).toFixed(0)}k`;
    return valeur.toString();
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "14px",
      padding: "18px",
      marginBottom: "24px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
        flexWrap: "wrap",
        gap: "10px",
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "800",
          color: "#0F172A",
        }}>
          Évolution des ventes
        </h2>

        <div style={{ display: "flex", gap: "6px", backgroundColor: "#F1F5F9", borderRadius: "8px", padding: "3px" }}>
          <button
            onClick={() => setPeriode("semaine")}
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: "700",
              border: "none",
              borderRadius: "6px",
              backgroundColor: periode === "semaine" ? "white" : "transparent",
              color: periode === "semaine" ? "#0F172A" : "#64748b",
              cursor: "pointer",
              boxShadow: periode === "semaine" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriode("mois")}
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: "700",
              border: "none",
              borderRadius: "6px",
              backgroundColor: periode === "mois" ? "#2563eb" : "transparent",
              color: periode === "mois" ? "white" : "#64748b",
              cursor: "pointer",
              boxShadow: periode === "mois" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
            }}
          >
            Mois
          </button>
        </div>
      </div>

      <p style={{
        fontSize: "12px",
        color: "#64748b",
        fontWeight: "500",
        marginBottom: "12px",
      }}>
        6 derniers mois
      </p>

      <div style={{ width: "100%", height: "220px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataAffichee} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#475569", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formaterMontant}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                padding: "10px 14px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              labelStyle={{ color: "#0F172A", fontWeight: "700", marginBottom: "4px" }}
              formatter={(value: number) => [`${value.toLocaleString("fr-FR")} FC`, "Ventes"]}
            />
            <Area
              type="monotone"
              dataKey="montant"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#colorVentes)"
              dot={{ fill: "#2563eb", r: 5, strokeWidth: 2, stroke: "white" }}
              activeDot={{ r: 7, fill: "#2563eb", stroke: "white", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "12px",
        paddingTop: "12px",
        borderTop: "1px solid #F1F5F9",
        fontSize: "12px",
        fontWeight: "600",
      }}>
        <span style={{ color: "#64748b" }}>
          {data.length > 0 ? `${data.length} mois affichés` : "Aucune donnée"}
        </span>
        <span style={{ color: "#16a34a", fontWeight: "700" }}>
          ↗ En croissance
        </span>
      </div>
    </div>
  );
      }
