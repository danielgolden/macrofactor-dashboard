"use client";

type DateRange = { start: string; end: string };

interface Props {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const PRESETS: { label: string; range: () => DateRange | null }[] = [
  { label: "Todo", range: () => null },
  {
    label: "Esta sem.",
    range: () => {
      const t = today();
      const day = t.getDay(); // 0=Sun
      const monday = addDays(t, day === 0 ? -6 : 1 - day);
      return { start: toISO(monday), end: toISO(t) };
    },
  },
  {
    label: "Últ. sem.",
    range: () => {
      const t = today();
      const day = t.getDay();
      const thisMonday = addDays(t, day === 0 ? -6 : 1 - day);
      const lastMonday = addDays(thisMonday, -7);
      const lastSunday = addDays(thisMonday, -1);
      return { start: toISO(lastMonday), end: toISO(lastSunday) };
    },
  },
  {
    label: "Este mes",
    range: () => {
      const t = today();
      const first = new Date(t.getFullYear(), t.getMonth(), 1);
      return { start: toISO(first), end: toISO(t) };
    },
  },
  {
    label: "Últ. mes",
    range: () => {
      const t = today();
      const firstOfThisMonth = new Date(t.getFullYear(), t.getMonth(), 1);
      const firstOfLastMonth = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const lastOfLastMonth = addDays(firstOfThisMonth, -1);
      return { start: toISO(firstOfLastMonth), end: toISO(lastOfLastMonth) };
    },
  },
  {
    label: "30 d",
    range: () => {
      const t = today();
      return { start: toISO(addDays(t, -30)), end: toISO(t) };
    },
  },
  {
    label: "90 d",
    range: () => {
      const t = today();
      return { start: toISO(addDays(t, -90)), end: toISO(t) };
    },
  },
  {
    label: "Este año",
    range: () => {
      const t = today();
      const first = new Date(t.getFullYear(), 0, 1);
      return { start: toISO(first), end: toISO(t) };
    },
  },
];

export function DateRangePicker({ value, onChange }: Props) {
  const activeLabel = (() => {
    if (!value) return "Todo";
    for (const p of PRESETS) {
      if (p.label === "Todo") continue;
      const r = p.range();
      if (r && r.start === value.start && r.end === value.end) return p.label;
    }
    return null;
  })();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 10,
      letterSpacing: 0.3,
    }}>
      {PRESETS.map((p) => {
        const isActive = p.label === "Todo" ? !value : activeLabel === p.label;
        return (
          <button
            key={p.label}
            onClick={() => onChange(p.range())}
            style={{
              padding: "4px 8px",
              border: "1px solid",
              borderColor: isActive ? "#a83c2a" : "#c4b49a",
              background: isActive ? "#a83c2a" : "transparent",
              color: isActive ? "#faf6ed" : "#6b4423",
              cursor: "pointer",
              textTransform: "uppercase",
              fontSize: 9,
              letterSpacing: 0.5,
              lineHeight: 1,
            }}
          >
            {p.label}
          </button>
        );
      })}

      <span style={{ color: "#c4b49a", margin: "0 2px" }}>|</span>

      <input
        type="date"
        value={value?.start ?? ""}
        onChange={(e) => {
          const start = e.target.value;
          if (start) onChange({ start, end: value?.end ?? start });
        }}
        style={{
          border: "1px solid #c4b49a",
          background: "transparent",
          color: "#2a1f1a",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          padding: "3px 6px",
          outline: "none",
        }}
      />
      <span style={{ color: "#a8702c" }}>→</span>
      <input
        type="date"
        value={value?.end ?? ""}
        onChange={(e) => {
          const end = e.target.value;
          if (end) onChange({ start: value?.start ?? end, end });
        }}
        style={{
          border: "1px solid #c4b49a",
          background: "transparent",
          color: "#2a1f1a",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          padding: "3px 6px",
          outline: "none",
        }}
      />
    </div>
  );
}
