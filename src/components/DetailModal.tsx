"use client";
import type { Food } from "@/lib/types";
import { ZONE_META, CAT_META } from "@/lib/types";

interface Props {
  food: Food | null;
  onClose: () => void;
  onCompare: (food: Food) => void;
  inCompare: boolean;
}

const RADAR_SIZE = 190;
const CX = RADAR_SIZE / 2;
const CY = RADAR_SIZE / 2;
const R = 68;
const GRID = [0.25, 0.5, 0.75, 1];

interface Axis {
  label: string;
  value: number; // 0-1
  rawLabel: string;
}

function radarPoint(i: number, n: number, value: number) {
  const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CX + R * value * Math.cos(angle),
    y: CY + R * value * Math.sin(angle),
    ax: CX + R * Math.cos(angle),
    ay: CY + R * Math.sin(angle),
    lx: CX + (R + 18) * Math.cos(angle),
    ly: CY + (R + 18) * Math.sin(angle),
  };
}

function RadarChart({ food }: { food: Food }) {
  const axes: Axis[] = [
    {
      label: "Proteína",
      value: food.proteinPct / 100,
      rawLabel: `${food.proteinPer100g.toFixed(1)}g/100g`,
    },
    {
      label: "Densidad",
      value: Math.min(food.calDensity / 8, 1),
      rawLabel: `${food.calDensity} kcal/g`,
    },
    {
      label: "Carbos",
      value: food.carbPct / 100,
      rawLabel: `${food.carbPer100g.toFixed(1)}g/100g`,
    },
    {
      label: "Grasa",
      value: food.fatPct / 100,
      rawLabel: `${food.fatPer100g.toFixed(1)}g/100g`,
    },
  ];

  const n = axes.length;
  const pts = axes.map((axis, i) => ({ ...axis, ...radarPoint(i, n, axis.value) }));
  const gridPts = axes.map((_, i) => radarPoint(i, n, 1));
  const dataPolygon = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const catColor = CAT_META[food.category].color;

  return (
    <svg width={RADAR_SIZE} height={RADAR_SIZE} style={{ display: "block", margin: "0 auto" }}>
      {/* Grid levels */}
      {GRID.map(level => {
        const gp = axes.map((_, i) => radarPoint(i, n, level));
        return (
          <polygon
            key={level}
            points={gp.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")}
            fill="none"
            stroke="#d4c4a0"
            strokeWidth={level === 1 ? 1 : 0.5}
          />
        );
      })}

      {/* Axis lines */}
      {gridPts.map((p, i) => (
        <line key={i} x1={CX} y1={CY} x2={p.ax.toFixed(2)} y2={p.ay.toFixed(2)} stroke="#d4c4a0" strokeWidth={0.5} />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill={catColor}
        fillOpacity={0.25}
        stroke={catColor}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={3.5} fill={catColor} />
      ))}

      {/* Labels */}
      {pts.map((p, i) => (
        <text
          key={i}
          x={p.lx.toFixed(2)}
          y={p.ly.toFixed(2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={8.5}
          fontFamily='"JetBrains Mono", monospace'
          fill="#6b4423"
          style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {p.label}
        </text>
      ))}

      {/* Percentage labels on data points (only when large enough) */}
      {pts.map((p, i) => {
        const pct = Math.round(p.value * 100);
        if (pct < 8) return null;
        return (
          <text
            key={`val-${i}`}
            x={(p.x + (p.x - CX) * 0.22).toFixed(2)}
            y={(p.y + (p.y - CY) * 0.22).toFixed(2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7.5}
            fontFamily='"JetBrains Mono", monospace'
            fill={catColor}
            fontWeight="bold"
          >
            {pct}%
          </text>
        );
      })}
    </svg>
  );
}

export function DetailModal({ food, onClose, onCompare, inCompare }: Props) {
  if (!food) return null;
  const z = ZONE_META[food.zone];
  const gramsFor100 = food.calDensity > 0 ? Math.round(100 / food.calDensity) : "∞";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(42,31,26,0.78)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 300 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#faf6ed", maxWidth: 500, width: "100%", padding: 30, border: `2px solid ${z.fill}`, position: "relative", maxHeight: "90vh", overflow: "auto" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", fontSize: 20, color: "#6b4423" }}>✕</button>

        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: z.fill, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          {z.label} densidad · {CAT_META[food.category].label}
        </div>
        <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 26, fontWeight: 700, color: "#2a1f1a", margin: "0 0 16px", lineHeight: 1.15 }}>{food.name}</h2>

        <div style={{ background: z.light, padding: 16, marginBottom: 18, borderLeft: `4px solid ${z.fill}` }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: z.fill, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>Densidad calórica</div>
          <div style={{ fontFamily: '"Fraunces", serif', fontSize: 48, fontWeight: 800, color: "#2a1f1a", lineHeight: 1 }}>
            {food.calDensity.toFixed(2)}<span style={{ fontSize: 16, marginLeft: 6, fontWeight: 500 }}>kcal/g</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
          {([
            ["Para 100 kcal", `${gramsFor100}g`],
            ["Porción típica", `${food.avgPortion.toFixed(0)}g`],
            ["Veces comido", `${food.timesEaten}×`],
            ["Total mes", `${food.totalCalories.toLocaleString()} kcal`],
            ["Total consumido", `${Math.round(food.totalWeight)}g`],
            ["Zona", z.label],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} style={{ borderTop: `2px solid ${z.fill}`, paddingTop: 7 }}>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#6b4423", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: '"Fraunces", serif', fontSize: 17, fontWeight: 600, color: "#2a1f1a" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Radar chart */}
        <div style={{ background: "#f5ebd6", padding: "16px 12px 12px", marginBottom: 18, borderLeft: `3px solid ${CAT_META[food.category].color}` }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#6b4423", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, textAlign: "center" }}>
            Perfil de macros
          </div>
          <RadarChart food={food} />
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#6b4423" }}>
            <span>P {food.proteinPer100g.toFixed(1)}g</span>
            <span>G {food.fatPer100g.toFixed(1)}g</span>
            <span>C {food.carbPer100g.toFixed(1)}g</span>
            <span style={{ color: "#a8702c" }}>· por 100g</span>
          </div>
        </div>

        <button
          onClick={() => { onCompare(food); onClose(); }}
          style={{ width: "100%", padding: "10px 0", background: inCompare ? "#a83c2a" : "#2a1f1a", color: "#faf6ed", border: "none", fontFamily: '"JetBrains Mono", monospace', fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}
        >
          {inCompare ? "✓ En comparación" : "+ Agregar a comparación"}
        </button>
      </div>
    </div>
  );
}
