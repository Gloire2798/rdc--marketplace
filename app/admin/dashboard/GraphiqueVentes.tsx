"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
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

  // Filtrer les données selon la période
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
        marginBottom: "16px",
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

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setPeriode("semaine")}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "600",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              backgroundColor: periode === "semaine" ? "white" : "transparent",
              color: periode === "semaine" ? "#0F172A" : "#64748b",
              cursor: "pointer",
            }}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriode("mois")}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              backgroundColor: periode === "mois" ? "#2563eb" : "transparent",
              color: periode === "mois" ? "white" : "#64748b",
              cursor: "pointer",
            }}
          >
            Mois
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: "220px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataAffichee} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={formaterMontant}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                padding: "8px",
              }}
              formatter={(value: number) => [`${value.toLocaleString("fr-FR")} FC`, "Ventes"]}
            />
            <Line
              type="monotone"
              dataKey="montant"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: "#2563eb", r: 5 }}
              activeDot={{ r: 7 }}
              fill="url(#colorVentes)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "12px",
        fontSize: "11px",
        color: "#64748b",
        fontWeight: "500",
      }}>
        <span>6 derniers mois</span>
        <span style={{ color: "#16a34a", fontWeight: "700" }}>
          {data.length > 0 && data[data.length - 1].montant > 0 ? "↗ En croissance" : "—"}
        </span>
      </div>
    </div>
  );
          }
