"use client";
import type { Food } from "@/lib/types";
import { ZONE_META, CAT_META } from "@/lib/types";

interface Props {
  foods: Food[];
  onClear: () => void;
  onRemove: (name: string) => void;
}

function CompareCard({ food, onRemove }: { food: Food; onRemove: () => void }) {
  const z = ZONE_META[food.zone];
  const cat = CAT_META[food.category];
  return (
    <div style={{ padding: 14, border: "1px solid #4a3a2a", position: "relative" }}>
      <button onClick={onRemove} style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", color: "#c9b896", fontSize: 16 }}>×</button>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#c9b896", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
        {z.label} · {cat.label}
      </div>
      <div style={{ fontFamily: '"Fraunces", serif', fontSize: 15, fontWeight: 600, lineHeight: 1.2, marginBottom: 10, paddingRight: 20, color: "#faf6ed" }}>{food.name}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 28, fontWeight: 600, color: "#faf6ed" }}>
        {food.calDensity.toFixed(2)}<span style={{ fontSize: 11, color: "#a8702c", marginLeft: 4 }}>kcal/g</span>
      </div>
      <div style={{ fontSize: 11, color: "#d4c4a0", marginTop: 6 }}>
        P {food.proteinPer100g.toFixed(1)} · C {food.carbPer100g.toFixed(1)} · G {food.fatPer100g.toFixed(1)} <span style={{ color: "#a8702c" }}>por 100g</span>
      </div>
    </div>
  );
}

export function CompareStrip({ foods, onClear, onRemove }: Props) {
  const [a, b] = foods;
  if (!a) return null;
  const ratio = b ? Math.max(a.calDensity, b.calDensity) / Math.min(a.calDensity, b.calDensity) : null;
  const heavier = b ? (a.calDensity > b.calDensity ? a : b) : null;
  const lighter = b ? (a.calDensity > b.calDensity ? b : a) : null;

  return (
    <div style={{ background: "#2a1f1a", color: "#faf6ed", padding: 20, marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 16, fontWeight: 600 }}>Comparación</span>
        <button onClick={onClear} style={{ background: "none", border: "1px solid #faf6ed", color: "#faf6ed", padding: "3px 10px", fontSize: 10, fontFamily: '"JetBrains Mono", monospace', textTransform: "uppercase", letterSpacing: 1 }}>
          Limpiar
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: b ? "1fr auto 1fr" : "1fr", gap: 16, alignItems: "center" }}>
        <CompareCard food={a} onRemove={() => onRemove(a.name)} />
        {b && (
          <>
            <div style={{ textAlign: "center", fontFamily: '"Fraunces", serif', fontStyle: "italic", color: "#c9b896", fontSize: 13 }}>
              {ratio!.toFixed(1)}×<br />
              <span style={{ fontSize: 9, fontFamily: '"JetBrains Mono", monospace', textTransform: "uppercase", letterSpacing: 1 }}>diferencia</span>
            </div>
            <CompareCard food={b} onRemove={() => onRemove(b.name)} />
          </>
        )}
      </div>
      {b && heavier && lighter && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #4a3a2a", fontSize: 12, color: "#d4c4a0", lineHeight: 1.5 }}>
          Para las calorías de <strong>100g de {heavier.name}</strong> ({Math.round(heavier.calDensity * 100)} kcal),
          necesitas <strong style={{ color: "#faf6ed" }}>{Math.round(ratio! * 100)}g de {lighter.name}</strong>.
        </div>
      )}
    </div>
  );
}
