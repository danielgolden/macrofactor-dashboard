"use client";
import { useEffect, useState } from "react";

interface DayData {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Tooltip {
  day: DayData;
  x: number;
  y: number;
}

const CELL = 13;
const GAP = 2;
const STEP = CELL + GAP;
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Monday-based ISO week day (0=Mon … 6=Sun)
function weekday(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  return (d.getDay() + 6) % 7;
}

function calColor(calories: number, max: number): string {
  if (calories === 0) return "#e8dcc8";
  const t = Math.min(calories / max, 1);
  // cream → amber → red-brown
  if (t < 0.33) {
    const u = t / 0.33;
    return lerpColor("#f5ebd6", "#a8702c", u);
  }
  const u = (t - 0.33) / 0.67;
  return lerpColor("#a8702c", "#a83c2a", u);
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

function buildGrid(days: DayData[]): {
  weeks: (DayData | null)[][];
  monthLabels: { label: string; col: number }[];
  startDate: string;
} {
  if (!days.length) return { weeks: [], monthLabels: [], startDate: "" };

  const map = new Map(days.map(d => [d.date, d]));

  // Find range: first day of first date's week → last day
  const first = new Date(days[0].date + "T00:00:00");
  const last  = new Date(days[days.length - 1].date + "T00:00:00");

  // Align start to Monday
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - startOffset);

  // Align end to Sunday
  const endOffset = (6 - (last.getDay() + 6) % 7);
  const gridEnd = new Date(last);
  gridEnd.setDate(gridEnd.getDate() + endOffset);

  const weeks: (DayData | null)[][] = [];
  const monthLabels: { label: string; col: number }[] = [];
  let seenMonth = -1;

  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const week: (DayData | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().slice(0, 10);
      if (d === 0 && cur.getMonth() !== seenMonth) {
        seenMonth = cur.getMonth();
        monthLabels.push({ label: MONTHS[seenMonth], col: weeks.length });
      }
      week.push(map.get(iso) ?? null);
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, monthLabels, startDate: gridStart.toISOString().slice(0, 10) };
}

interface Props {
  dateRange: { start: string; end: string } | null;
}

export function CalendarHeatmap({ dateRange }: Props) {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateRange) {
      params.set("startDate", dateRange.start);
      params.set("endDate", dateRange.end);
    }
    fetch(`/api/daily?${params}`)
      .then(r => r.json())
      .then(d => { setDays(d.days ?? []); })
      .finally(() => setLoading(false));
  }, [dateRange]);

  if (loading) return (
    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "#a8702c", padding: "40px 0", textAlign: "center" }}>
      Cargando…
    </div>
  );

  if (!days.length) return (
    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: "#6b4423", padding: "40px 0", textAlign: "center" }}>
      No hay datos para el período seleccionado.
    </div>
  );

  const maxCal = Math.max(...days.map(d => d.calories));
  const avgCal = days.reduce((s, d) => s + d.calories, 0) / days.length;
  const { weeks, monthLabels } = buildGrid(days);

  const svgW = weeks.length * STEP + 28; // 28px for day labels
  const svgH = 7 * STEP + 24; // 24px for month labels

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 600, color: "#2a1f1a", margin: "0 0 6px" }}>
          Mapa de actividad calórica
        </h2>
        <p style={{ fontSize: 13, color: "#6b4423", margin: 0, lineHeight: 1.5 }}>
          Cada celda = un día · Color por calorías totales · Hover para detalle
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 24, marginBottom: 18, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#6b4423", flexWrap: "wrap" }}>
        <span>días registrados: <strong style={{ color: "#2a1f1a" }}>{days.length}</strong></span>
        <span>máximo diario: <strong style={{ color: "#a83c2a" }}>{Math.round(maxCal).toLocaleString()} kcal</strong></span>
        <span>promedio diario: <strong style={{ color: "#a8702c" }}>{Math.round(avgCal).toLocaleString()} kcal</strong></span>
      </div>

      {/* Heatmap SVG */}
      <div style={{ overflowX: "auto", paddingBottom: 8 }} onMouseLeave={() => setTooltip(null)}>
        <svg width={svgW} height={svgH} style={{ display: "block" }}>
          {/* Month labels */}
          {monthLabels.map(({ label, col }) => (
            <text
              key={label + col}
              x={28 + col * STEP}
              y={10}
              fontSize={8}
              fontFamily='"JetBrains Mono", monospace'
              fill="#a8702c"
              style={{ textTransform: "uppercase" }}
            >
              {label}
            </text>
          ))}

          {/* Day labels */}
          {DAYS.map((d, i) => (
            <text
              key={d}
              x={0}
              y={24 + i * STEP + CELL / 2 + 3}
              fontSize={7}
              fontFamily='"JetBrains Mono", monospace'
              fill="#a8702c"
              dominantBaseline="middle"
            >
              {d}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const x = 28 + wi * STEP;
              const y = 24 + di * STEP;
              const fill = day ? calColor(day.calories, maxCal) : "#f0e8d8";
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  fill={fill}
                  rx={2}
                  style={{ cursor: day ? "pointer" : "default" }}
                  onMouseEnter={(e) => { if (day) setTooltip({ day, x: e.clientX, y: e.clientY }); }}
                  onMouseMove={(e) => { if (day) setTooltip({ day, x: e.clientX, y: e.clientY }); }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 8, color: "#6b4423" }}>
        <span>Menos</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map(t => (
          <div key={t} style={{ width: CELL, height: CELL, background: calColor(t * maxCal, maxCal), borderRadius: 2 }} />
        ))}
        <span>Más</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
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
          lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{tooltip.day.date}</div>
          <div>{Math.round(tooltip.day.calories).toLocaleString()} kcal</div>
          <div style={{ color: "rgba(250,246,237,0.65)", fontSize: 10 }}>
            P {Math.round(tooltip.day.protein)}g · G {Math.round(tooltip.day.fat)}g · C {Math.round(tooltip.day.carbs)}g
          </div>
        </div>
      )}
    </div>
  );
}
