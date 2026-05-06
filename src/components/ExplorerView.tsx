"use client";
import type { Food } from "@/lib/types";
import { ZONE_META } from "@/lib/types";

const MAX_DENSITY = 8;

interface Props {
  foods: Food[];
  compareList: Food[];
  toggleCompare: (food: Food) => void;
  onSelect: (food: Food) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
}

export function ExplorerView({ foods, compareList, toggleCompare, onSelect, sortBy, setSortBy }: Props) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: '"Fraunces", serif', fontSize: 18, fontWeight: 600, color: "#2a1f1a" }}>{foods.length} alimentos</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "6px 10px", fontSize: 12, background: "#fff", border: "1px solid #c9b896", fontFamily: '"JetBrains Mono", monospace', color: "#2a1f1a" }}>
          <option value="density">Densidad (alta → baja)</option>
          <option value="totalCal">Calorías totales (mes)</option>
          <option value="portion">Porción promedio</option>
          <option value="frequency">Frecuencia</option>
          <option value="name">Alfabético</option>
        </select>
      </div>

      {/* Scale */}
      <div style={{ display: "flex", height: 5, marginBottom: 4 }}>
        {Object.values(ZONE_META).map((v) => (
          <div key={v.label} style={{ flex: 1, background: v.fill, opacity: 0.35 }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#a8702c", marginBottom: 12 }}>
        <span>0</span><span>1.5</span><span>4</span><span>8+ kcal/g</span>
      </div>

      {foods.map((food, i) => {
        const z = ZONE_META[food.zone];
        const widthPct = Math.min(100, (food.calDensity / MAX_DENSITY) * 100);
        const inComp = compareList.some((f) => f.name === food.name);
        return (
          <div key={food.name} style={{ display: "grid", gridTemplateColumns: "minmax(170px,1fr) 2fr auto", gap: 12, alignItems: "center", padding: "9px 0", borderBottom: "1px solid #ede4d0" }}>
            <button onClick={() => onSelect(food)}
              style={{ background: "none", border: "none", textAlign: "left", padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#a8702c", minWidth: 22 }}>{String(i + 1).padStart(3, "0")}</span>
              <span style={{ fontSize: 13, color: "#2a1f1a", lineHeight: 1.2 }}>{food.name}</span>
            </button>
            <div style={{ position: "relative", height: 20, background: "#f5ebd6", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${widthPct}%`, background: z.fill }} />
              <div style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                left: widthPct > 18 ? 8 : `calc(${widthPct}% + 6px)`,
                color: widthPct > 18 ? "#faf6ed" : "#2a1f1a",
                fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
              }}>
                {food.calDensity.toFixed(2)}
              </div>
            </div>
            <button onClick={() => toggleCompare(food)}
              style={{ padding: "3px 9px", fontSize: 10, border: `1px solid ${inComp ? "#a83c2a" : "#c9b896"}`, background: inComp ? "#a83c2a" : "transparent", color: inComp ? "#faf6ed" : "#6b4423", fontFamily: '"JetBrains Mono", monospace', textTransform: "uppercase", letterSpacing: 0.5 }}>
              {inComp ? "✓" : "+"} cmp
            </button>
          </div>
        );
      })}
    </div>
  );
}
