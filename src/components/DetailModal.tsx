"use client";
import type { Food } from "@/lib/types";
import { ZONE_META, CAT_META } from "@/lib/types";

interface Props {
  food: Food | null;
  onClose: () => void;
  onCompare: (food: Food) => void;
  inCompare: boolean;
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
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

        <div style={{ background: "#f5ebd6", padding: 12, borderLeft: "3px solid #a8702c", fontSize: 12, color: "#6b4423", lineHeight: 1.5, marginBottom: 16 }}>
          <strong>Macros por 100g:</strong> Proteína {food.proteinPer100g.toFixed(1)}g · Carbos {food.carbPer100g.toFixed(1)}g · Grasa {food.fatPer100g.toFixed(1)}g
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
