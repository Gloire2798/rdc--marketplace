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
      borderRadius: "20px",
      padding: "16px",
      marginBottom: "16px",
      border: "1px solid #D4C5A0",
      boxShadow: "0 2px 8px rgba(120, 100, 60, 0.06)",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        flexWrap: "wrap",
        gap: "8px",
      }}>
        <h2 style={{
          fontSize: "13px",
          fontWeight: "900",
          color: "#0F172A",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Évolution des ventes
        </h2>

        <div style={{
          display: "flex",
          gap: "3px",
          backgroundColor: "#F5EAD2",
          borderRadius: "10px",
          padding: "3px",
          border: "1px solid #D4C5A0",
        }}>
          <button
            onClick={() => setPeriode("semaine")}
            style={{
              padding: "4px 10px",
              fontSize: "10.5px",
              fontWeight: "800",
              border: "none",
              borderRadius: "7px",
              backgroundColor: periode === "semaine" ? "#0F172A" : "transparent",
              color: periode === "semaine" ? "white" : "#57534E",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
            }}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriode("mois")}
            style={{
              padding: "4px 10px",
              fontSize: "10.5px",
              fontWeight: "800",
              border: "none",
              borderRadius: "7px",
              backgroundColor: periode === "mois" ? "#0F172A" : "transparent",
              color: periode === "mois" ? "white" : "#57534E",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
            }}
          >
            Mois
          </button>
        </div>
      </div>

      {dataAffichee.length === 0 ? (
        <div style={{ textAlign: "center", padding: "34px 20px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#F5EAD2",
            marginBottom: "8px",
          }}>
            <TrendingUp size={22} color="#EA580C" strokeWidth={2} />
          </div>
          <p style={{ fontSize: "11.5px", fontWeight: "800", color: "#57534E" }}>
            Aucune vente pour le moment
          </p>
        </div>
      ) : (
        <>
          <p style={{
            fontSize: "10.5px",
            color: "#57534E",
            fontWeight: "800",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}>
            {dataAffichee.length} mois avec des ventes
          </p>

          <div style={{ width: "100%", height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataAffichee} margin={{ top: 10, right: 8, left: -28, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EA580C" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#EA580C" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#D4C5A0" vertical={false} />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 10, fill: "#57534E", fontWeight: 700 }}
                  axisLine={{ stroke: "#D4C5A0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#57534E", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formaterMontant}
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
                  labelStyle={{ color: "white", fontWeight: "900", marginBottom: "3px" }}
                  itemStyle={{ color: "#EA580C", fontWeight: "900" }}
                  formatter={(value: number) => [`${value.toLocaleString("fr-FR")} FC`, "Ventes"]}
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="#EA580C"
                  strokeWidth={2.5}
                  fill="url(#colorVentes)"
                  dot={{ fill: "#EA580C", r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, fill: "#EA580C", stroke: "white", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
          }
