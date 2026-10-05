"use client";

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
  "#16A34A",
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
  const formaterY = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value}`;
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "20px",
      padding: "16px",
      border: "1px solid #D4C5A0",
      boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
    }}>
      {/* En-tête */}
      <div style={{ marginBottom: "12px" }}>
        <p style={{
          fontSize: "12px",
          fontWeight: "900",
          color: "#0F172A",
          textTransform: "uppercase",
          letterSpacing: "0.6px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            display: "inline-block",
            width: "3px",
            height: "13px",
            backgroundColor: "#EA580C",
            borderRadius: "2px",
          }} />
          Évolution des ventes
        </p>
        <p style={{
          fontSize: "10.5px",
          color: "#57534E",
          fontWeight: "700",
          marginTop: "3px",
          marginLeft: "11px",
        }}>
          {boutiques.length} boutique{boutiques.length > 1 ? "s" : ""} · 6 derniers mois
        </p>
      </div>

      {/* Graphique */}
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={donnees}
            margin={{ top: 10, right: 8, left: -22, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#D4C5A0" vertical={false} />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 10, fill: "#57534E", fontWeight: 700 }}
              axisLine={{ stroke: "#D4C5A0" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formaterY}
              tick={{ fontSize: 10, fill: "#57534E", fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                border: "none",
                borderRadius: "10px",
                fontSize: "11px",
                padding: "8px 12px",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
                color: "white",
              }}
              labelStyle={{ color: "white", fontWeight: "900", marginBottom: "4px" }}
              itemStyle={{ fontWeight: "800" }}
              formatter={(value: number) => `${value.toLocaleString("fr-FR")} FC`}
            />
            <Legend
              wrapperStyle={{
                fontSize: "10.5px",
                fontWeight: "800",
                color: "#0F172A",
                paddingTop: "10px",
              }}
              iconType="line"
              iconSize={14}
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
        </ResponsiveContainer>
      </div>
    </div>
  );
        }
