"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import type { Food, Zone, Category } from "@/lib/types";
import { VIEWS, type ViewId } from "@/lib/views";
import { useFoods } from "@/lib/useFoods";
import { useDateRangeBounds } from "@/lib/useDateRangeBounds";
import { computeInitialRange, type DateRange } from "@/lib/dateRange";
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
import { ChatView } from "./ChatView";
import { CalorieShareDonut } from "./CalorieShareDonut";
import {
  ExplorerSkeleton,
  ScatterSkeleton,
  RankingSkeleton,
  TreemapSkeleton,
} from "./LoadingSkeletons";

export function Explorer() {
  const [view, setView]         = useState<ViewId>("explorer");
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const { bounds, loading: boundsLoading } = useDateRangeBounds();

  useEffect(() => {
    if (boundsLoading || dateRange) return;
    setDateRange(computeInitialRange(bounds));
  }, [boundsLoading, bounds, dateRange]);

  const { foods: rawFoods, loading, error, setFoods } = useFoods(dateRange);

  useEffect(() => { setPage(1); }, [search]);

  const handleDateRangeChange = useCallback((range: DateRange | null) => {
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
    const q = search.trim().toLowerCase();
    return rawFoods.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q)) return false;
      if (activeZones.size > 0 && !activeZones.has(f.zone)) return false;
      if (activeCategories.size > 0 && !activeCategories.has(f.category)) return false;
      return true;
    });
  }, [rawFoods, search, activeZones, activeCategories]);

  const stats = useMemo(() => {
    const totalW = rawFoods.reduce((s, f) => s + f.totalWeight, 0);
    const totalCal = rawFoods.reduce((s, f) => s + f.totalCalories, 0);
    return { count: rawFoods.length, avgDensity: totalW > 0 ? totalCal / totalW : 0 };
  }, [rawFoods]);

  const PAGE_SIZE = 100;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const [prevAvgDensity, setPrevAvgDensity] = useState<number | null>(null);
  const [prevAvgDensityLoading, setPrevAvgDensityLoading] = useState(false);
  useEffect(() => {
    if (!dateRange) {
      setPrevAvgDensity(null);
      setPrevAvgDensityLoading(false);
      return;
    }
    setPrevAvgDensityLoading(true);

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
      .catch(() => setPrevAvgDensity(null))
      .finally(() => setPrevAvgDensityLoading(false));

    return () => controller.abort();
  }, [dateRange]);

  const trend = useMemo(() => {
    if (prevAvgDensity === null || stats.avgDensity <= 0 || prevAvgDensity <= 0) return null;
    return ((stats.avgDensity - prevAvgDensity) / prevAvgDensity) * 100;
  }, [stats.avgDensity, prevAvgDensity]);

  const currentView = VIEWS.find((v) => v.id === view)!;

  // The sidebar + header chrome is always mounted; loading/error/empty states
  // are scoped to the content area below so the nav never disappears.
  // Trends and Chat views manage their own loading state, so they bypass the
  // foods loading/error branches entirely.
  const isDataView = view !== "trends" && view !== "chat";
  const showLoading = isDataView && (loading || boundsLoading);
  const showError = isDataView && !showLoading && error;

  const skeleton = (() => {
    switch (view) {
      case "scatter":   return <ScatterSkeleton />;
      case "ranking":   return <RankingSkeleton />;
      case "treemap":   return <TreemapSkeleton />;
      default:           return <ExplorerSkeleton />;
    }
  })();

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

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
            {view === "trends" ? (
              <div className="px-4 sm:px-6 lg:px-6">
                <TrendsView />
              </div>
            ) : view === "chat" ? (
              <div className="px-4 sm:px-6 lg:px-6">
                <ChatView />
              </div>
            ) : showLoading ? (
              <>{skeleton}</>
            ) : showError ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center lg:px-6">
                <p className="text-lg font-semibold text-destructive">Error loading data</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : rawFoods.length === 0 ? (
              <div className="px-4 sm:px-6 lg:px-6">
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
                <div className="px-4 sm:px-6 lg:px-6">
                  <DateRangePicker value={dateRange} onChange={handleDateRangeChange} bounds={bounds} />
                </div>

                {/* Stats cards */}
                <SectionCards
                  stats={stats}
                  trend={trend}
                  prevAvgDensityLoading={prevAvgDensityLoading}
                />

                {/* Top foods calorie-share donut */}
                <div className="px-4 sm:px-6 lg:px-6">
                  <CalorieShareDonut foods={rawFoods} onSelect={setSelected} />
                </div>

                <div className="flex min-w-0 flex-col gap-4 px-4 sm:px-6 lg:px-6">
                  <Controls search={search} setSearch={setSearch} activeZones={activeZones} setActiveZones={setActiveZones} activeCategories={activeCategories} setActiveCategories={setActiveCategories} />

                  {compareList.length > 0 && (
                    <CompareStrip foods={compareList} onClear={() => setCompareList([])} onRemove={(name) => setCompareList((p) => p.filter((f) => f.name !== name))} />
                  )}

                  {view === "explorer" && (
                    <>
                      <ExplorerView foods={paged} compareList={compareList} toggleCompare={toggleCompare} onSelect={setSelected} />
                      {totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-4">
                          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className="rounded-md border px-3 py-1.5 disabled:opacity-40">
                            ← prev
                          </button>
                          <span className="whitespace-nowrap text-muted-foreground">{currentPage} / {totalPages} · {filtered.length} foods</span>
                          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
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
