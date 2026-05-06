"use client";
import { useMemo } from "react";
import type { Food } from "@/lib/types";
import { ZONE_META } from "@/lib/types";

export function RankingView({ foods, onSelect }: { foods: Food[]; onSelect: (f: Food) => void }) {
  const top = useMemo(() => [...foods].sort((a, b) => b.totalCalories - a.totalCalories).slice(0, 30), [foods]);
  const maxCal = top[0]?.totalCalories || 1;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: "#a8702c", marginBottom: 8, paddingLeft: 220 }}>
        <span>0</span>
        <span>{Math.round(maxCal / 2).toLocaleString()}</span>
        <span>{maxCal.toLocaleString()} kcal</span>
      </div>
      {top.map((f, i) => {
        const barW = (f.totalCalories / maxCal) * 100;
        const z = ZONE_META[f.zone];
        return (
          <div key={f.name} onClick={() => onSelect(f)}
            style={{ display: "grid", gridTemplateColumns: "26px 188px 1fr 78px", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: "1px solid #ede4d0", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5ebd6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: i < 3 ? "#a83c2a" : "#a8702c", textAlign: "right" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: "#2a1f1a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.name}
            </span>
            <div style={{ position: "relative", height: 18, background: "#ede4d0" }}>
              <div style={{ height: "100%", width: `${barW}%`, background: z.fill }} />
              <span style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#6b4423", opacity: 0.75 }}>
                {f.avgPortion.toFixed(0)}g · {f.timesEaten}×
              </span>
            </div>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: z.fill, textAlign: "right", fontWeight: 600 }}>
              {f.totalCalories.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
