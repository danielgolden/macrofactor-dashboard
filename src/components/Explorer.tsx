"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import type { Food, Zone, Category } from "@/lib/types";
import { VIEWS, type ViewId } from "@/lib/views";
import { useFoods } from "@/lib/useFoods";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { SectionCards } from "./section-cards";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Controls } from "./Controls";
import { CompareStrip } from "./CompareStrip";
import { DetailModal } from "./DetailModal";
import { ExplorerView } from "./ExplorerView";
import { ScatterView } from "./ScatterView";
import { RankingView } from "./RankingView";
import { ImportButton } from "./ImportButton";
import { DateRangePicker } from "./DateRangePicker";
import { TreemapView } from "./TreemapView";
import { TrendsView } from "./TrendsView";
import { CalorieShareDonut } from "./CalorieShareDonut";

export function Explorer() {
  const [view, setView]         = useState<ViewId>("explorer");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
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

  const fetchAll = view !== "explorer" && view !== "trends" && !dateRange;
  const { foods: rawFoods, total, totalPages, loading, error, setFoods } = useFoods(debouncedSearch, page, dateRange, fetchAll);

  const handleDateRangeChange = useCallback((range: { start: string; end: string } | null) => {
    setDateRange(range);
    setPage(1);
  }, []);

  const [activeZones, setActiveZones]           = useState<Set<Zone>>(new Set());
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());
  const [selected, setSelected] = useState<Food | null>(null);
  const [compareList, setCompareList] = useState<Food[]>([]);

  const toggleCompare = useCallback((food: Food) => {
    setCompareList((prev) => {
      if (prev.find((f) => f.name === food.name)) return prev.filter((f) => f.name !== food.name);
      if (prev.length >= 2) return [prev[1], food];
      return [...prev, food];
    });
  }, []);

  const filtered = useMemo(() => {
    return rawFoods.filter((f) => {
      if (activeZones.size > 0 && !activeZones.has(f.zone)) return false;
      if (activeCategories.size > 0 && !activeCategories.has(f.category)) return false;
      return true;
    });
  }, [rawFoods, activeZones, activeCategories]);

  const stats = useMemo(() => {
    const totalW = rawFoods.reduce((s, f) => s + f.totalWeight, 0);
    const totalCal = rawFoods.reduce((s, f) => s + f.totalCalories, 0);
    return { count: rawFoods.length, avgDensity: totalW > 0 ? totalCal / totalW : 0 };
  }, [rawFoods]);

  const [prevAvgDensity, setPrevAvgDensity] = useState<number | null>(null);
  useEffect(() => {
    if (!dateRange) {
      setPrevAvgDensity(null);
      return;
    }
    const start = new Date(dateRange.start + "T00:00:00");
    const end = new Date(dateRange.end + "T00:00:00");
    const durationDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - durationDays);

    const params = new URLSearchParams({
      startDate: prevStart.toISOString().slice(0, 10),
      endDate: prevEnd.toISOString().slice(0, 10),
      all: "true",
    });

    const controller = new AbortController();
    fetch(`/api/foods?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.error || !d.foods?.length) {
          setPrevAvgDensity(null);
          return;
        }
        const prevTotalW = d.foods.reduce((s: number, f: Food) => s + f.totalWeight, 0);
        const prevTotalCal = d.foods.reduce((s: number, f: Food) => s + f.totalCalories, 0);
        const prevAvg = prevTotalW > 0 ? prevTotalCal / prevTotalW : 0;
        setPrevAvgDensity(prevAvg > 0 ? prevAvg : null);
      })
      .catch(() => setPrevAvgDensity(null));

    return () => controller.abort();
  }, [dateRange]);

  const trend = useMemo(() => {
    if (prevAvgDensity === null || stats.avgDensity <= 0 || prevAvgDensity <= 0) return null;
    return ((stats.avgDensity - prevAvgDensity) / prevAvgDensity) * 100;
  }, [stats.avgDensity, prevAvgDensity]);

  const currentView = VIEWS.find((v) => v.id === view)!;

  if (loading && view !== "trends") return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading data…</p>
    </div>
  );

  if (error && view !== "trends") return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <p className="text-lg font-semibold text-destructive">Error loading data</p>
      <p className="text-sm text-muted-foreground">{error}</p>
    </div>
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" view={view} onViewChange={setView} />
      <SidebarInset>
        <SiteHeader title={currentView.label}>
          <ImportButton onImported={setFoods} />
        </SiteHeader>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            {view === "trends" ? (
              <div className="px-4 lg:px-6">
                <TrendsView />
              </div>
            ) : rawFoods.length === 0 ? (
              <div className="px-4 lg:px-6">
                <Card>
                  <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                    <h2 className="text-2xl font-semibold">No data yet</h2>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Import your MacroFactor Excel (.xlsx) or CSV file to get started.
                    </p>
                    <ImportButton onImported={setFoods} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Date range picker */}
                <div className="px-4 lg:px-6">
                  <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
                </div>

                {/* Stats cards */}
                <SectionCards stats={stats} trend={trend} />

                {/* Top foods calorie-share donut */}
                <div className="px-4 lg:px-6">
                  <CalorieShareDonut foods={rawFoods} onSelect={setSelected} />
                </div>

                <div className="flex flex-col gap-4 px-4 lg:px-6">
                  <Controls search={search} setSearch={setSearch} activeZones={activeZones} setActiveZones={setActiveZones} activeCategories={activeCategories} setActiveCategories={setActiveCategories} />

                  {compareList.length > 0 && (
                    <CompareStrip foods={compareList} onClear={() => setCompareList([])} onRemove={(name) => setCompareList((p) => p.filter((f) => f.name !== name))} />
                  )}

                  {view === "explorer" && (
                    <>
                      <ExplorerView foods={filtered} compareList={compareList} toggleCompare={toggleCompare} onSelect={setSelected} />
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 text-xs">
                          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                            className="rounded-md border px-3 py-1.5 disabled:opacity-40">
                            ← prev
                          </button>
                          <span className="text-muted-foreground">{page} / {totalPages} · {total} foods</span>
                          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="rounded-md border px-3 py-1.5 disabled:opacity-40">
                            next →
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {view === "scatter" && (
                    <>
                      <div>
                        <h2 className="text-lg font-semibold">Caloric density vs. portion you eat</h2>
                        <p className="text-sm text-muted-foreground">Y-axis = density (kcal/g) · X-axis = average grams per occasion · Size = frequency</p>
                      </div>
                      <ScatterView foods={filtered} onSelect={setSelected} />
                    </>
                  )}
                  {view === "ranking" && (
                    <>
                      <div>
                        <h2 className="text-lg font-semibold">Top 30 · Total calories in the month</h2>
                        <p className="text-sm text-muted-foreground">What <em>really</em> dominates your intake — not by density, but by total volume.</p>
                      </div>
                      <RankingView foods={filtered} onSelect={setSelected} />
                    </>
                  )}
                  {view === "treemap" && (
                    <TreemapView foods={filtered} onSelect={setSelected} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>

      <DetailModal food={selected} onClose={() => setSelected(null)} onCompare={(food) => { toggleCompare(food); setSelected(null); }} inCompare={selected ? compareList.some((f) => f.name === selected.name) : false} />
    </SidebarProvider>
  );
}
