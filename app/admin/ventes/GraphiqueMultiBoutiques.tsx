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
  Legend,
} from "recharts";

interface Props {
  donnees: Record<string, string | number>[];
  boutiques: string[];
}

const COULEURS = [
  "#1D4ED8",
  "#16a34a",
  "#EA580C",
  "#9333EA",
  "#EC4899",
  "#0891B2",
  "#CA8A04",
  "#DC2626",
  "#0F172A",
  "#65A30D",
];

export default function GraphiqueMultiBoutiques({ donnees, boutiques }: Props) {
  const [periode, setPeriode] = useState<"semaine" | "mois">("mois");

  const formaterY = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "14px",
      border: "1px solid #E2E8F0",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
      }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A" }}>
            Évolution des ventes
          </p>
          <p style={{ fontSize: "10.5px", color: "#64748B", fontWeight: "600", marginTop: "2px" }}>
            {boutiques.length} boutique{boutiques.length > 1 ? "s" : ""}
          </p>
        </div>

        <div style={{
          display: "flex",
          backgroundColor: "#F1F5F9",
          borderRadius: "8px",
          padding: "2px",
        }}>
          <button
            onClick={() => setPeriode("semaine")}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: periode === "semaine" ? "#1D4ED8" : "transparent",
              color: periode === "semaine" ? "white" : "#64748B",
              fontSize: "10.5px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriode("mois")}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: periode === "mois" ? "#1D4ED8" : "transparent",
              color: periode === "mois" ? "white" : "#64748B",
              fontSize: "10.5px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Mois
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={donnees} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 10, fill: "#64748B", fontWeight: 700 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formaterY}
              tick={{ fontSize: 10, fill: "#64748B", fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "700",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.1)",
              }}
              formatter={(value: number) => `${value.toLocaleString("fr-FR")} FC`}
            />
            <Legend
              wrapperStyle={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#475569",
                paddingTop: "8px",
              }}
            />
            {boutiques.map((nom, index) => (
              <Line
                key={nom}
                type="monotone"
                dataKey={nom}
                stroke={COULEURS[index % COULEURS.length]}
                strokeWidth={2.2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
          }
