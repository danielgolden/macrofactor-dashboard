"use client";
import { useState } from "react";
import type { Food } from "@/lib/types";
import { ZONE_META } from "@/lib/types";

const MAX_DENSITY = 8;
const MAX_PORTION = 800;
const W = 700, H = 400;
const PAD = { top: 28, right: 24, bottom: 56, left: 56 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

const xS = (v: number) => Math.min(IW, (Math.min(v, MAX_PORTION) / MAX_PORTION) * IW);
const yS = (v: number) => IH - Math.min(IH, (Math.min(v, MAX_DENSITY) / MAX_DENSITY) * IH);

const X_TICKS = [0, 100, 200, 300, 400, 500, 600, 700, 800];
const Y_TICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function ScatterView({ foods, onSelect }: { foods: Food[]; onSelect: (f: Food) => void }) {
  const [hovered, setHovered] = useState<Food | null>(null);
  const qX = xS(150), qY = yS(1.5);

  return (
    <div>
      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <svg width={W} height={H} style={{ fontFamily: '"JetBrains Mono", monospace', display: "block", margin: "0 auto" }}>
          <defs><clipPath id="ca"><rect x={0} y={0} width={IW} height={IH} /></clipPath></defs>
          <g transform={`translate(${PAD.left},${PAD.top})`}>
            {/* Quadrant backgrounds */}
            <rect x={0}  y={0}  width={qX}      height={qY}      fill="#f0d4cc" opacity={0.28} />
            <rect x={qX} y={0}  width={IW - qX} height={qY}      fill="#f0d4cc" opacity={0.14} />
            <rect x={0}  y={qY} width={qX}      height={IH - qY} fill="#e8f1e4" opacity={0.28} />
            <rect x={qX} y={qY} width={IW - qX} height={IH - qY} fill="#f5ebd6" opacity={0.22} />

            {/* Quadrant labels */}
            {([["CALORÍAS OCULTAS", qX / 2, 12, "#a83c2a"], ["PELIGRO REAL", qX + (IW - qX) / 2, 12, "#a83c2a"],
               ["ZONA SEGURA", qX / 2, qY + 15, "#4a7c2a"], ["VOLUMEN ALTO", qX + (IW - qX) / 2, qY + 15, "#a8702c"]] as [string, number, number, string][])
              .map(([t, x, y, c]) => <text key={t} x={x} y={y} textAnchor="middle" fontSize={8.5} fill={c} opacity={0.75} letterSpacing={1}>{t}</text>)}

            {/* Grid */}
            {X_TICKS.map((t) => <line key={t} x1={xS(t)} y1={0} x2={xS(t)} y2={IH} stroke="#d4c4a0" strokeWidth={0.5} strokeDasharray="3,3" />)}
            {Y_TICKS.map((t) => <line key={t} x1={0} y1={yS(t)} x2={IW} y2={yS(t)} stroke="#d4c4a0" strokeWidth={0.5} strokeDasharray="3,3" />)}

            {/* Dividers */}
            <line x1={qX} y1={0} x2={qX} y2={IH} stroke="#6b4423" strokeWidth={1} strokeDasharray="5,3" opacity={0.4} />
            <line x1={0} y1={qY} x2={IW} y2={qY} stroke="#6b4423" strokeWidth={1} strokeDasharray="5,3" opacity={0.4} />

            {/* Axes */}
            <line x1={0} y1={IH} x2={IW} y2={IH} stroke="#2a1f1a" strokeWidth={1.5} />
            <line x1={0} y1={0}  x2={0}  y2={IH} stroke="#2a1f1a" strokeWidth={1.5} />

            {X_TICKS.map((t) => (
              <g key={t} transform={`translate(${xS(t)},${IH})`}>
                <line y2={5} stroke="#2a1f1a" strokeWidth={1} />
                <text y={17} textAnchor="middle" fontSize={8.5} fill="#6b4423">{t}{t === 800 ? "+" : ""}</text>
              </g>
            ))}
            {Y_TICKS.map((t) => (
              <g key={t} transform={`translate(0,${yS(t)})`}>
                <line x2={-5} stroke="#2a1f1a" strokeWidth={1} />
                <text x={-7} textAnchor="end" dominantBaseline="middle" fontSize={8.5} fill="#6b4423">{t}</text>
              </g>
            ))}

            <text x={IW / 2} y={IH + 44} textAnchor="middle" fontSize={9.5} fill="#2a1f1a" letterSpacing={1.5}>PORCIÓN PROMEDIO (g)</text>
            <text x={-IH / 2} y={-42} textAnchor="middle" fontSize={9.5} fill="#2a1f1a" transform="rotate(-90)" letterSpacing={1.5}>DENSIDAD (kcal/g)</text>

            {/* Dots */}
            <g clipPath="url(#ca)">
              {foods.map((f) => {
                const cx = xS(f.avgPortion), cy = yS(f.calDensity);
                const isH = hovered?.name === f.name;
                const r = Math.max(4, Math.min(11, Math.sqrt(f.timesEaten) * 2.1));
                return (
                  <circle key={f.name} cx={cx} cy={cy} r={r}
                    fill={ZONE_META[f.zone].fill} opacity={isH ? 1 : 0.7}
                    stroke={isH ? "#2a1f1a" : "none"} strokeWidth={2}
                    style={{ cursor: "pointer", transition: "all 0.12s" }}
                    onMouseEnter={() => setHovered(f)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelect(f)}
                  />
                );
              })}
            </g>

            {/* Tooltip */}
            {hovered && (() => {
              const cx = xS(hovered.avgPortion), cy = yS(hovered.calDensity);
              const tw = 168, th = 68;
              const tx = cx + tw + 10 > IW ? cx - tw - 6 : cx + 8;
              const ty = cy - th < 0 ? cy + 4 : cy - th;
              return (
                <g>
                  <rect x={tx} y={ty} width={tw} height={th} fill="#2a1f1a" />
                  <text x={tx + 8} y={ty + 14} fontSize={9.5} fill="#faf6ed" fontWeight="600">{hovered.name.length > 22 ? hovered.name.slice(0, 21) + "…" : hovered.name}</text>
                  <text x={tx + 8} y={ty + 28} fontSize={8.5} fill="#c9b896">{hovered.calDensity.toFixed(2)} kcal/g · {hovered.avgPortion.toFixed(0)}g/vez</text>
                  <text x={tx + 8} y={ty + 42} fontSize={8.5} fill="#c9b896">{hovered.timesEaten}× comido · {hovered.totalCalories} kcal total</text>
                  <text x={tx + 8} y={ty + 58} fontSize={8.5} fill="#a8702c">Clic para detalle →</text>
                </g>
              );
            })()}
          </g>
        </svg>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#6b4423" }}>
        <span>● tamaño = frecuencia</span>
        {Object.entries(ZONE_META).map(([k, v]) => <span key={k}><span style={{ color: v.fill }}>●</span> {v.label}</span>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
        {([
          ["🔴 Calorías ocultas", "Alta densidad, porción pequeña. Mantequilla, gummies, condensed milk.", "#f0d4cc", "#a83c2a"],
          ["🚨 Peligro real", "Alta densidad Y porción grande. Los más impactantes de tu dieta.", "#fde8d8", "#a83c2a"],
          ["✅ Zona segura", "Baja densidad, porción pequeña. Sin preocupación.", "#e8f1e4", "#4a7c2a"],
          ["🍠 Volumen alto", "Baja densidad pero comes mucho. Sweet Potato, Banana, Greek Yogurt.", "#f5ebd6", "#a8702c"],
        ] as [string, string, string, string][]).map(([title, desc, bg, col]) => (
          <div key={title} style={{ background: bg, padding: 12, borderLeft: `3px solid ${col}` }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600, color: col, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#2a1f1a", lineHeight: 1.4 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
