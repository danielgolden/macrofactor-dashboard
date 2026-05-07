"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import type { Food, Zone, Category } from "@/lib/types";
import { ZONE_META } from "@/lib/types";
import { useFoods } from "@/lib/useFoods";
import { Controls } from "./Controls";
import { CompareStrip } from "./CompareStrip";
import { DetailModal } from "./DetailModal";
import { ExplorerView } from "./ExplorerView";
import { ScatterView } from "./ScatterView";
import { RankingView } from "./RankingView";
import { ImportButton } from "./ImportButton";
import { DateRangePicker } from "./DateRangePicker";
import { TreemapView } from "./TreemapView";
import { CalendarHeatmap } from "./CalendarHeatmap";

const VIEWS = [
  { id: "explorer", label: "Explorador" },
  { id: "scatter",  label: "Densidad vs Porción" },
  { id: "ranking",  label: "Ranking Mensual" },
  { id: "treemap",  label: "Mapa de Calorías" },
  { id: "calendar", label: "Calendario" },
] as const;

type ViewId = typeof VIEWS[number]["id"];

export function Explorer() {
  const [view, setView]         = useState<ViewId>("explorer");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [sortBy, setSortBy]     = useState("density");
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  // Debounce search → reset page when it changes
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [search]);

  const { foods: rawFoods, total, totalPages, loading, error, setFoods } = useFoods(debouncedSearch, page, dateRange);

  const handleDateRangeChange = useCallback((range: { start: string; end: string } | null) => {
    setDateRange(range);
    setPage(1);
  }, []);

  const [activeZones, setActiveZones]           = useState<Set<Zone>>(new Set(["low", "medium", "high"]));
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set(["protein", "carb", "fat", "mixed"]));
  const [selected, setSelected] = useState<Food | null>(null);
  const [compareList, setCompareList] = useState<Food[]>([]);

  const toggleZone = useCallback((z: Zone) => {
    setActiveZones((prev) => { const n = new Set(prev); n.has(z) ? (n.size > 1 && n.delete(z)) : n.add(z); return n; });
  }, []);

  const toggleCategory = useCallback((c: Category) => {
    setActiveCategories((prev) => { const n = new Set(prev); n.has(c) ? (n.size > 1 && n.delete(c)) : n.add(c); return n; });
  }, []);

  const toggleCompare = useCallback((food: Food) => {
    setCompareList((prev) => {
      if (prev.find((f) => f.name === food.name)) return prev.filter((f) => f.name !== food.name);
      if (prev.length >= 2) return [prev[1], food];
      return [...prev, food];
    });
  }, []);

  const filtered = useMemo(() => {
    const sorts: Record<string, (a: Food, b: Food) => number> = {
      density:   (a, b) => b.calDensity - a.calDensity,
      totalCal:  (a, b) => b.totalCalories - a.totalCalories,
      portion:   (a, b) => b.avgPortion - a.avgPortion,
      frequency: (a, b) => b.timesEaten - a.timesEaten,
      name:      (a, b) => a.name.localeCompare(b.name),
    };
    return rawFoods
      .filter((f) => {
        if (!activeZones.has(f.zone)) return false;
        if (!activeCategories.has(f.category)) return false;
        return true;
      })
      .sort(sorts[sortBy] ?? sorts.density);
  }, [rawFoods, activeZones, activeCategories, sortBy]);

  const stats = useMemo(() => {
    const totalCal = rawFoods.reduce((s, f) => s + f.totalCalories, 0);
    const totalW   = rawFoods.reduce((s, f) => s + f.totalWeight, 0);
    return { count: rawFoods.length, totalCal, avgDensity: totalW > 0 ? totalCal / totalW : 0 };
  }, [rawFoods]);

  const sortedByDensity = useMemo(() => [...rawFoods].sort((a, b) => b.calDensity - a.calDensity), [rawFoods]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf6ed" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#a8702c", letterSpacing: 2, textTransform: "uppercase" }}>
        Cargando datos…
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf6ed", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: '"Fraunces", serif', fontSize: 20, color: "#a83c2a" }}>Error cargando datos</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: "#6b4423" }}>{error}</div>
    </div>
  );

  return (
    <div style={{ background: "#faf6ed", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ borderBottom: "2px solid #2a1f1a", padding: "24px 24px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 2, color: "#a8702c", textTransform: "uppercase", marginBottom: 6 }}>
              MacroFactor · {stats.count} alimentos
            </div>
            <h1 style={{ fontFamily: '"Fraunces", serif', fontWeight: 800, fontSize: "clamp(28px,5vw,52px)", color: "#2a1f1a", margin: 0, lineHeight: 0.95, letterSpacing: "-0.02em" }}>
              Lo que comes,<br />
              <em style={{ color: "#a83c2a", fontStyle: "italic" }}>en números.</em>
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ImportButton onImported={setFoods} />
            <UserButton />
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ background: "#2a1f1a", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex" }}>
          {VIEWS.map((v) => (
            <button key={v.id} onClick={() => setView(v.id)}
              style={{ padding: "13px 20px", fontSize: 12, border: "none", borderBottom: view === v.id ? "3px solid #a83c2a" : "3px solid transparent", background: "transparent", color: view === v.id ? "#faf6ed" : "#a8702c", fontFamily: '"JetBrains Mono", monospace', letterSpacing: 0.5, textTransform: "uppercase" }}>
              {v.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Date range picker */}
      <div style={{ background: "#faf6ed", borderBottom: "1px solid #e8dcc8", padding: "10px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>
      </div>

      {/* Stats strip */}
      {rawFoods.length > 0 && (
        <div style={{ background: "#f5ebd6", borderBottom: "1px solid #d4c4a0", padding: "10px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 24, flexWrap: "wrap", fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: "#6b4423" }}>
            <span>+ denso: <strong style={{ color: "#a83c2a" }}>{sortedByDensity[0]?.name} ({sortedByDensity[0]?.calDensity} kcal/g)</strong></span>
            <span>− denso: <strong style={{ color: "#4a7c2a" }}>{sortedByDensity[sortedByDensity.length - 1]?.name} ({sortedByDensity[sortedByDensity.length - 1]?.calDensity} kcal/g)</strong></span>
            <span>promedio: <strong>{stats.avgDensity.toFixed(2)} kcal/g</strong></span>
            <span>total mes: <strong>{stats.totalCal.toLocaleString()} kcal</strong></span>
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 80px" }}>
        {rawFoods.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontFamily: '"Fraunces", serif', fontSize: 28, fontWeight: 600, color: "#2a1f1a", marginBottom: 12 }}>No hay datos aún</div>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: "#6b4423", marginBottom: 24, lineHeight: 1.5 }}>
              Importa tu archivo Excel (.xlsx) o CSV de MacroFactor para comenzar.
            </p>
            <ImportButton onImported={setFoods} />
          </div>
        ) : (
          <>
            <Controls search={search} setSearch={setSearch} activeZones={activeZones} toggleZone={toggleZone} activeCategories={activeCategories} toggleCategory={toggleCategory} />

            {compareList.length > 0 && (
              <CompareStrip foods={compareList} onClear={() => setCompareList([])} onRemove={(name) => setCompareList((p) => p.filter((f) => f.name !== name))} />
            )}

            {view === "explorer" && (
              <>
                <ExplorerView foods={filtered} compareList={compareList} toggleCompare={toggleCompare} onSelect={setSelected} sortBy={sortBy} setSortBy={setSortBy} />
                {!debouncedSearch && totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 32, fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ padding: "6px 14px", border: "1px solid #a8702c", background: "transparent", color: page === 1 ? "#c4b49a" : "#a8702c", cursor: page === 1 ? "default" : "pointer" }}>
                      ← anterior
                    </button>
                    <span style={{ color: "#6b4423" }}>{page} / {totalPages} · {total} alimentos</span>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ padding: "6px 14px", border: "1px solid #a8702c", background: "transparent", color: page === totalPages ? "#c4b49a" : "#a8702c", cursor: page === totalPages ? "default" : "pointer" }}>
                      siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
            {view === "scatter" && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 600, color: "#2a1f1a", margin: "0 0 6px" }}>Densidad calórica vs. porción que comes</h2>
                  <p style={{ fontSize: 13, color: "#6b4423", margin: 0, lineHeight: 1.5 }}>Eje Y = densidad (kcal/g) · Eje X = gramos promedio por ocasión · Tamaño = frecuencia</p>
                </div>
                <ScatterView foods={filtered} onSelect={setSelected} />
              </>
            )}
            {view === "ranking" && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 600, color: "#2a1f1a", margin: "0 0 6px" }}>Top 30 · Calorías totales en el mes</h2>
                  <p style={{ fontSize: 13, color: "#6b4423", margin: 0, lineHeight: 1.5 }}>Quién <em>realmente</em> domina tu ingesta — no por densidad, sino por volumen total.</p>
                </div>
                <RankingView foods={filtered} onSelect={setSelected} />
              </>
            )}
            {view === "treemap" && (
              <TreemapView foods={filtered} onSelect={setSelected} />
            )}
            {view === "calendar" && (
              <CalendarHeatmap dateRange={dateRange} />
            )}
          </>
        )}
      </main>

      <DetailModal food={selected} onClose={() => setSelected(null)} onCompare={(food) => { toggleCompare(food); setSelected(null); }} inCompare={selected ? compareList.some((f) => f.name === selected.name) : false} />
    </div>
  );
}
