"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import type { Food } from "@/lib/types";
import { CAT_META } from "@/lib/types";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  food: Food;
}

const HEIGHT = 520;

function squarify(foods: Food[], w: number, h: number): Rect[] {
  if (!foods.length || w <= 0 || h <= 0) return [];

  const total = foods.reduce((s, f) => s + f.totalCalories, 0);
  if (total === 0) return [];

  const totalArea = w * h;
  const sorted = [...foods].sort((a, b) => b.totalCalories - a.totalCalories);

  function area(f: Food) {
    return (f.totalCalories / total) * totalArea;
  }

  function worst(row: Food[], side: number): number {
    const rowSum = row.reduce((s, f) => s + area(f), 0);
    const maxA = Math.max(...row.map(area));
    const minA = Math.min(...row.map(area));
    const s2 = side * side;
    const r2 = rowSum * rowSum;
    return Math.max((s2 * maxA) / r2, r2 / (s2 * minA));
  }

  const rects: Rect[] = [];
  let remaining = sorted;
  let rx = 0, ry = 0, rw = w, rh = h;

  while (remaining.length > 0 && rw > 0.5 && rh > 0.5) {
    const side = Math.min(rw, rh);
    let row: Food[] = [remaining[0]];

    for (let i = 1; i < remaining.length; i++) {
      const candidate = [...row, remaining[i]];
      if (worst(candidate, side) <= worst(row, side)) {
        row = candidate;
      } else {
        break;
      }
    }

    const rowSum = row.reduce((s, f) => s + area(f), 0);

    if (rw >= rh) {
      const stripW = rowSum / rh;
      let cy = ry;
      for (const food of row) {
        const cellH = area(food) / stripW;
        rects.push({ x: rx, y: cy, w: stripW, h: cellH, food });
        cy += cellH;
      }
      rx += stripW;
      rw -= stripW;
    } else {
      const stripH = rowSum / rw;
      let cx = rx;
      for (const food of row) {
        const cellW = area(food) / stripH;
        rects.push({ x: cx, y: ry, w: cellW, h: stripH, food });
        cx += cellW;
      }
      ry += stripH;
      rh -= stripH;
    }

    remaining = remaining.slice(row.length);
  }

  return rects;
}

interface Props {
  foods: Food[];
  onSelect: (food: Food) => void;
}

interface Tooltip {
  food: Food;
  x: number;
  y: number;
}

export function TreemapView({ foods, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const rects = useMemo(
    () => (width > 0 ? squarify(foods, width, HEIGHT) : []),
    [foods, width]
  );

  const total = useMemo(
    () => foods.reduce((s, f) => s + f.totalCalories, 0),
    [foods]
  );

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 600, color: "#2a1f1a", margin: "0 0 6px" }}>
          Mapa de calorías
        </h2>
        <p style={{ fontSize: 13, color: "#6b4423", margin: 0, lineHeight: 1.5 }}>
          Área proporcional a calorías totales consumidas · Color por categoría · Click para detalle
        </p>
      </div>

      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", height: HEIGHT, background: "#2a1f1a", overflow: "hidden" }}
        onMouseLeave={() => { setTooltip(null); setHovered(null); }}
      >
        {rects.map(({ x, y, w, h, food }) => {
          const color = CAT_META[food.category].color;
          const isHovered = hovered === food.name;
          const pct = total > 0 ? ((food.totalCalories / total) * 100).toFixed(1) : "0";
          const showName = w > 72 && h > 28;
          const showCals = w > 72 && h > 48;

          return (
            <div
              key={food.name}
              onClick={() => onSelect(food)}
              onMouseEnter={(e) => {
                setHovered(food.name);
                setTooltip({ food, x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setTooltip({ food, x: e.clientX, y: e.clientY });
              }}
              style={{
                position: "absolute",
                left: x + 1,
                top: y + 1,
                width: Math.max(0, w - 2),
                height: Math.max(0, h - 2),
                background: color,
                opacity: isHovered ? 1 : 0.82,
                cursor: "pointer",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: showName ? "6px 8px" : 0,
                boxSizing: "border-box",
                transition: "opacity 0.1s",
              }}
            >
              {showName && (
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: Math.min(11, Math.max(8, w / 12)),
                  color: "#faf6ed",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.2,
                  textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}>
                  {food.name}
                </span>
              )}
              {showCals && (
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: Math.min(10, Math.max(7, w / 14)),
                  color: "rgba(250,246,237,0.75)",
                  lineHeight: 1.3,
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}>
                  {food.totalCalories.toLocaleString()} kcal · {pct}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#6b4423" }}>
        {(Object.entries(CAT_META) as [string, { label: string; color: string }][]).map(([, meta]) => (
          <span key={meta.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, background: meta.color, display: "inline-block" }} />
            {meta.label}
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            background: "#2a1f1a",
            color: "#faf6ed",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            padding: "8px 12px",
            pointerEvents: "none",
            zIndex: 1000,
            lineHeight: 1.6,
            maxWidth: 220,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{tooltip.food.name}</div>
          <div>{tooltip.food.totalCalories.toLocaleString()} kcal totales</div>
          <div>{total > 0 ? ((tooltip.food.totalCalories / total) * 100).toFixed(1) : 0}% del período</div>
          <div style={{ color: "rgba(250,246,237,0.6)", marginTop: 4 }}>
            {tooltip.food.calDensity} kcal/g · ×{tooltip.food.timesEaten} veces
          </div>
          <div style={{ color: "rgba(250,246,237,0.6)" }}>
            P {tooltip.food.proteinPct}% · G {tooltip.food.fatPct}% · C {tooltip.food.carbPct}%
          </div>
        </div>
      )}
    </div>
  );
}
