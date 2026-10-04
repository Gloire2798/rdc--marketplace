"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
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
  const [style, setStyle] = useState<"aires" | "lignes">("aires");

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
      {/* En-tête avec filtres */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "12px",
        gap: "6px",
        flexWrap: "wrap",
      }}>
        <div style={{ minWidth: "100px" }}>
          <p style={{ fontSize: "13px", fontWeight: "800", color: "#0F172A" }}>
            Évolution des ventes
          </p>
          <p style={{ fontSize: "10.5px", color: "#64748B", fontWeight: "600", marginTop: "2px" }}>
            {boutiques.length} boutique{boutiques.length > 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {/* Choix style */}
          <div style={{
            display: "flex",
            backgroundColor: "#F1F5F9",
            borderRadius: "8px",
            padding: "2px",
          }}>
            <button
              onClick={() => setStyle("aires")}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: style === "aires" ? "#1D4ED8" : "transparent",
                color: style === "aires" ? "white" : "#64748B",
                fontSize: "10px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Aires
            </button>
            <button
              onClick={() => setStyle("lignes")}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: style === "lignes" ? "#1D4ED8" : "transparent",
                color: style === "lignes" ? "white" : "#64748B",
                fontSize: "10px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Lignes
            </button>
          </div>

          {/* Choix période */}
          <div style={{
            display: "flex",
            backgroundColor: "#F1F5F9",
            borderRadius: "8px",
            padding: "2px",
          }}>
            <button
              onClick={() => setPeriode("semaine")}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: periode === "semaine" ? "#1D4ED8" : "transparent",
                color: periode === "semaine" ? "white" : "#64748B",
                fontSize: "10px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Sem.
            </button>
            <button
              onClick={() => setPeriode("mois")}
              style={{
                padding: "5px 8px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: periode === "mois" ? "#1D4ED8" : "transparent",
                color: periode === "mois" ? "white" : "#64748B",
                fontSize: "10px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          {style === "aires" ? (
            <AreaChart
              data={donnees}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                {boutiques.map((nom, index) => {
                  const couleur = COULEURS[index % COULEURS.length];
                  return (
                    <linearGradient
                      key={nom}
                      id={`grad-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={couleur} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={couleur} stopOpacity={0.02} />
                    </linearGradient>
                  );
                })}
              </defs>
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
                formatter={(value: number) =>
                  `${value.toLocaleString("fr-FR")} FC`
                }
              />
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#475569",
                  paddingTop: "8px",
                }}
              />
              {boutiques.map((nom, index) => {
                const couleur = COULEURS[index % COULEURS.length];
                return (
                  <Area
                    key={nom}
                    type="monotone"
                    dataKey={nom}
                    stroke={couleur}
                    strokeWidth={2.4}
                    fill={`url(#grad-${index})`}
                    dot={{ r: 3, fill: couleur, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: couleur, stroke: "white", strokeWidth: 2 }}
                    animationDuration={800}
                  />
                );
              })}
            </AreaChart>
          ) : (
            <LineChart
              data={donnees}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
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
                formatter={(value: number) =>
                  `${value.toLocaleString("fr-FR")} FC`
                }
              />
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: "700",
                  color: "#475569",
                  paddingTop: "8px",
                }}
              />
              {boutiques.map((nom, index) => {
                const couleur = COULEURS[index % COULEURS.length];
                return (
                  <Line
                    key={nom}
                    type="monotone"
                    dataKey={nom}
                    stroke={couleur}
                    strokeWidth={2.6}
                    dot={{ r: 3.5, fill: couleur, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: couleur, stroke: "white", strokeWidth: 2 }}
                    animationDuration={800}
                  />
                );
              })}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
  }
