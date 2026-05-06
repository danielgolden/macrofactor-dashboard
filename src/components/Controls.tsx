"use client";
import type { Zone, Category } from "@/lib/types";
import { ZONE_META, CAT_META } from "@/lib/types";

interface Props {
  search: string;
  setSearch: (s: string) => void;
  activeZones: Set<Zone>;
  toggleZone: (z: Zone) => void;
  activeCategories: Set<Category>;
  toggleCategory: (c: Category) => void;
}

export function Controls({ search, setSearch, activeZones, toggleZone, activeCategories, toggleCategory }: Props) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #d4c4a0" }}>
      {/* Search */}
      <div style={{ flex: "1 1 240px" }}>
        <label style={{ display: "block", fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.5, color: "#6b4423", textTransform: "uppercase", marginBottom: 6 }}>Buscar</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a8702c", fontSize: 14 }}>⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ej. banana, cottage, eggs..."
            style={{ width: "100%", padding: "9px 32px 9px 30px", fontSize: 14, background: "#fff", border: "1px solid #c9b896", color: "#2a1f1a", outline: "none", boxSizing: "border-box" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#a8702c", fontSize: 18, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      {/* Zone filters */}
      <div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.5, color: "#6b4423", textTransform: "uppercase", marginBottom: 6 }}>Zona</div>
        <div style={{ display: "flex", gap: 5 }}>
          {(Object.keys(ZONE_META) as Zone[]).map((k) => {
            const v = ZONE_META[k];
            const on = activeZones.has(k);
            return (
              <button key={k} onClick={() => toggleZone(k)}
                style={{ padding: "6px 11px", fontSize: 12, border: `1px solid ${v.fill}`, background: on ? v.fill : "transparent", color: on ? "#faf6ed" : v.fill, fontFamily: '"JetBrains Mono", monospace' }}>
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filters */}
      <div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.5, color: "#6b4423", textTransform: "uppercase", marginBottom: 6 }}>Macro</div>
        <div style={{ display: "flex", gap: 5 }}>
          {(Object.keys(CAT_META) as Category[]).map((k) => {
            const v = CAT_META[k];
            const on = activeCategories.has(k);
            return (
              <button key={k} onClick={() => toggleCategory(k)}
                style={{ padding: "6px 11px", fontSize: 12, border: `1px solid ${v.color}`, background: on ? v.color : "transparent", color: on ? "#faf6ed" : v.color, fontFamily: '"JetBrains Mono", monospace' }}>
                {v.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
