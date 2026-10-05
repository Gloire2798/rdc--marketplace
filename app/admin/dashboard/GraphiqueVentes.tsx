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
import { TrendingUp } from "lucide-react";

interface VenteMois {
  mois: string;
  fc: number;
  usd: number;
}

interface GraphiqueVentesProps {
  data: VenteMois[];
}

export default function GraphiqueVentes({ data }: GraphiqueVentesProps) {
  const [periode, setPeriode] = useState<"semaine" | "mois">("mois");

  // Filtre : si "semaine" → dernier mois uniquement ; sinon → tous les mois avec données
  const dataFiltree = data.filter((d) => d.fc > 0 || d.usd > 0);
  const dataAffichee = periode === "semaine" ? data.slice(-1) : dataFiltree;

  const formaterMontantFC = (valeur: number) => {
    if (valeur >= 1000000) return `${(valeur / 1000000).toFixed(1)}M`;
    if (valeur >= 1000) return `${(valeur / 1000).toFixed(0)}k`;
    return valeur.toString();
  };

  const formaterMontantUSD = (valeur: number) => {
    if (valeur >= 1000) return `${(valeur / 1000).toFixed(1)}k`;
    return valeur.toFixed(0);
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
      {/* HEADER */}
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

          <div style={{ width: "100%", height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataAffichee} margin={{ top: 10, right: 14, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#D4C5A0" vertical={false} />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 10, fill: "#57534E", fontWeight: 700 }}
                  axisLine={{ stroke: "#D4C5A0" }}
                  tickLine={false}
                />
                {/* Axe FC (à gauche) */}
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "#1D4ED8", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formaterMontantFC}
                />
                {/* Axe USD (à droite) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#16A34A", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formaterMontantUSD}
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
                  formatter={(value: number, name: string) => {
                    if (name === "Ventes FC") {
                      return [`${value.toLocaleString("fr-FR")} FC`, "Ventes FC"];
                    }
                    return [`${value.toFixed(2)} $`, "Ventes USD"];
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    fontWeight: "800",
                    paddingTop: "8px",
                  }}
                  iconType="line"
                  iconSize={14}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="fc"
                  name="Ventes FC"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  dot={{ fill: "#1D4ED8", r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, fill: "#1D4ED8", stroke: "white", strokeWidth: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="usd"
                  name="Ventes USD"
                  stroke="#16A34A"
                  strokeWidth={2.5}
                  dot={{ fill: "#16A34A", r: 4, strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, fill: "#16A34A", stroke: "white", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* LÉGENDE MANUELLE (style premium) */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "10px",
            paddingTop: "10px",
            borderTop: "1px dashed #D4C5A0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                width: "16px",
                height: "3px",
                backgroundColor: "#1D4ED8",
                borderRadius: "2px",
              }} />
              <span style={{ fontSize: "10.5px", fontWeight: "900", color: "#1D4ED8" }}>
                FC
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                width: "16px",
                height: "3px",
                backgroundColor: "#16A34A",
                borderRadius: "2px",
              }} />
              <span style={{ fontSize: "10.5px", fontWeight: "900", color: "#16A34A" }}>
                USD
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
                }
