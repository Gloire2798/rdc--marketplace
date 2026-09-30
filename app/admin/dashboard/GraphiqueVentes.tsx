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
import { TrendingUp } from "lucide-react";

interface VenteMois {
  mois: string;
  montant: number;
}

interface GraphiqueVentesProps {
  data: VenteMois[];
}

export default function GraphiqueVentes({ data }: GraphiqueVentesProps) {
  const [periode, setPeriode] = useState<"semaine" | "mois">("mois");

  const dataFiltree = data.filter((d) => d.montant > 0);
  const dataAffichee = periode === "semaine" ? data.slice(-1) : dataFiltree;

  const formaterMontant = (valeur: number) => {
    if (valeur >= 1000000) return `${(valeur / 1000000).toFixed(1)}M`;
    if (valeur >= 1000) return `${(valeur / 1000).toFixed(0)}k`;
    return valeur.toString();
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "10px",
      padding: "12px",
      marginBottom: "16px",
      boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
      border: "1px solid #F1F5F9",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
        flexWrap: "wrap",
        gap: "8px",
      }}>
        <h2 style={{
          fontSize: "14px",
          fontWeight: "800",
          color: "#0F172A",
        }}>
          Évolution des ventes
        </h2>

        <div style={{ display: "flex", gap: "3px", backgroundColor: "#F1F5F9", borderRadius: "7px", padding: "2px" }}>
          <button
            onClick={() => setPeriode("semaine")}
            style={{
              padding: "3px 9px",
              fontSize: "10px",
              fontWeight: "700",
              border: "none",
              borderRadius: "5px",
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
              padding: "3px 9px",
              fontSize: "10px",
              fontWeight: "700",
              border: "none",
              borderRadius: "5px",
              backgroundColor: periode === "mois" ? "#1D4ED8" : "transparent",
              color: periode === "mois" ? "white" : "#64748b",
              cursor: "pointer",
            }}
          >
            Mois
          </button>
        </div>
      </div>

      {dataAffichee.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "30px 20px",
          color: "#94a3b8",
        }}>
          <TrendingUp size={24} strokeWidth={1.5} style={{ marginBottom: "6px" }} />
          <p style={{ fontSize: "11px", fontWeight: "600" }}>
            Aucune vente pour le moment
          </p>
        </div>
      ) : (
        <>
          <p style={{
            fontSize: "10px",
            color: "#64748b",
            fontWeight: "600",
            marginBottom: "8px",
          }}>
            {dataAffichee.length} mois avec des ventes
          </p>

          <div style={{ width: "100%", height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataAffichee} margin={{ top: 10, right: 8, left: -28, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formaterMontant}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "11px",
                    padding: "6px 10px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  labelStyle={{ color: "#0F172A", fontWeight: "700", marginBottom: "2px" }}
                  formatter={(value: number) => [`${value.toLocaleString("fr-FR")} FC`, "Ventes"]}
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="#1D4ED8"
                  strokeWidth={2}
                  fill="url(#colorVentes)"
                  dot={{ fill: "#1D4ED8", r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, fill: "#1D4ED8", stroke: "white", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
              }
