"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, LoaderCircleIcon, RotateCcwIcon, SettingsIcon } from "lucide-react";

import type { Food, Zone, Category } from "@/lib/types";
import { VIEWS, type ViewId } from "@/lib/views";
import { useFoods } from "@/lib/useFoods";
import { useDateRangeBounds } from "@/lib/useDateRangeBounds";
import { computeInitialRange, type DateRange } from "@/lib/dateRange";
import { useUser } from "@clerk/nextjs";
import { useExplorerLayout, type BlockId } from "@/lib/useExplorerLayout";
import { ExplorerBlockFrame } from "./ExplorerBlockFrame";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { SectionCards } from "./section-cards";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Controls } from "./Controls";
import { CompareStrip } from "./CompareStrip";
import { DetailModal } from "./DetailModal";
import { ExplorerView } from "./ExplorerView";
import { ScatterView } from "./ScatterView";
import { RankingView } from "./RankingView";
import { ImportButton } from "./ImportButton";
import { OnboardingModal } from "./OnboardingModal";
import { dummyFoods } from "@/lib/dummyData";
import { toast } from "sonner";
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

  // When the user has no real data yet, render the dashboard with static
  // dummy foods behind a blur overlay (see the empty-state branch below).
  // The moment real data is imported, `hasRealData` flips true and the
  // dummy data / blur / onboarding modal are discarded.
  const hasRealData = rawFoods.length > 0;
  const displayFoods = hasRealData ? rawFoods : dummyFoods;

  const handleClearData = useCallback(async () => {
    try {
      const res = await fetch("/api/foods", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear data");
      setFoods([]);
      toast.success("Your data has been removed.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to clear data. Please try again.");
    }
  }, [setFoods]);

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
    return displayFoods.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q)) return false;
      if (activeZones.size > 0 && !activeZones.has(f.zone)) return false;
      if (activeCategories.size > 0 && !activeCategories.has(f.category)) return false;
      return true;
    });
  }, [displayFoods, search, activeZones, activeCategories]);

  const stats = useMemo(() => {
    const totalW = displayFoods.reduce((s, f) => s + f.totalWeight, 0);
    const totalCal = displayFoods.reduce((s, f) => s + f.totalCalories, 0);
    return {
      count: displayFoods.length,
      avgDensity: totalW > 0 ? totalCal / totalW : 0,
      totalCalories: totalCal,
      highDensityCalories: 0,
      highDensityPct: 0,
    };
  }, [displayFoods]);

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

  // ----- Explorer layout customization (#21) -----------------------------
  //
  // The Explorer page is composed of three rearrangeable blocks (Step 2 of
  // the plan): stats cards, the calorie-share donut, and the food table.
  // DateRangePicker stays pinned above the sortable list, Controls stays
  // pinned *below* it (the user said during the plan review that controls
  // belong with the data they filter, not as a sortable top-level block).
  // CompareStrip and pagination travel inside the table block.
  //
  // State machine:
  //   - arranging === false: identical to before this PR. No dnd listeners,
  //     no drag handles, no per-block frames.
  //   - arranging === true:   frames become opaque click-to-grab, the table
  //     becomes a condensed preview, and the bottom bar exposes Reset / Done.
  //
  // The layout hook is key'd per Clerk user, stored in localStorage, and
  // merges (rather than rejects) on shape mismatch so adding a fourth
  // block in the future won't wipe out existing users' saved order.
  const { user } = useUser();
  const { order, setOrder, reset } = useExplorerLayout(user?.id ?? null);
  const [arranging, setArranging] = useState(false);

  // Arrange mode is unavailable when the dummy-data preview is showing —
  // there is nothing to rearrange behind it. See issue #21's guardrails.
  const canArrange = hasRealData && view === "explorer";

  // Stats block title for the arrange-mode header. Compact label only;
  // the actual stat value is rendered inert inside the frame.
  const tableNode = view !== "explorer" ? null : (
    <>
      <ExplorerView foods={paged} compareList={compareList} toggleCompare={toggleCompare} onSelect={setSelected} />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-xs">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="rounded-md border px-3 py-1.5 disabled:opacity-40">
            ← prev
          </button>
          <span className="text-muted-foreground">{currentPage} / {totalPages} · {filtered.length} foods</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="rounded-md border px-3 py-1.5 disabled:opacity-40">
            next →
          </button>
        </div>
      )}
    </>
  );

  // Reduce motion preference — drop the sortable transition when set.
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const sensors = useSensors(
    useSensor(PointerSensor),
    // Touch: 8px movement / 250ms delay so scrolling the page on mobile
    // doesn't trigger a drag. From the dnd-kit docs.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(String(active.id) as BlockId);
    const to = order.indexOf(String(over.id) as BlockId);
    if (from < 0 || to < 0) return;
    // Persist the new order. The hook merges, so writing the same
    // canonical list with two ids swapped is safe across releases.
    setOrder(arrayMove(order, from, to));
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" view={view} onViewChange={setView} onClearData={handleClearData} />
      <SidebarInset>
        <SiteHeader title={currentView.label}>
          <ImportButton onImported={setFoods} />
          {canArrange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setArranging((a) => !a)}
              aria-pressed={arranging}
              aria-label="Customize Explorer layout"
              title={arranging ? "Done customizing" : "Customize layout"}
              className="h-8 gap-1.5"
            >
              <SettingsIcon className="size-3.5" />
              <span>{arranging ? "Done" : "Customize"}</span>
            </Button>
          )}
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
              skeleton
            ) : showError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <p className="text-lg font-semibold text-destructive">Error loading foods</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : (
              <div className="relative flex flex-col gap-4 md:gap-6">
                <div
                  className={
                    hasRealData
                      ? "contents"
                      : "pointer-events-none select-none blur-md flex flex-col gap-4 md:gap-6"
                  }
                >
                  {/* Date range picker — pinned at the top, NOT rearrangeable. */}
                  <div className="px-4 lg:px-6">
                    <DateRangePicker value={dateRange} onChange={handleDateRangeChange} bounds={bounds} />
                  </div>

                  {/* Explorer block list.
                   *
                   * Step 1 of the plan: a single column container carries all
                   * padding/gap, no per-block wrappers. This is the layout
                   * dnd-kit measures against; three different wrappers with
                   * two padding regimes would make drops land wrong.
                   *
                   * Non-Explorer views render their existing layout, untouched.
                   */}
                  {view === "explorer" && (
                    arranging ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        modifiers={
                          prefersReducedMotion
                            ? [restrictToVerticalAxis, restrictToParentElement]
                            : [restrictToVerticalAxis, restrictToParentElement]
                        }
                        onDragEnd={onDragEnd}
                      >
                        <SortableContext items={order} strategy={verticalListSortingStrategy}>
                          <div className="flex flex-col gap-3 px-4 lg:px-6">
                            {order.map((id) => {
                              if (id === "stats") {
                                return (
                                  <SortableBlockFrame
                                    key="stats"
                                    id="stats"
                                    label="Stats cards"
                                    arranging={arranging}
                                  >
                                    <div className="pointer-events-none max-h-32 overflow-hidden opacity-60 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
                                      <SectionCards
                                        stats={stats}
                                        trend={trend}
                                        highDensityTrend={null}
                                        prevAvgDensityLoading={prevAvgDensityLoading}
                                      />
                                    </div>
                                  </SortableBlockFrame>
                                );
                              }
                              if (id === "donut") {
                                return (
                                  <SortableBlockFrame
                                    key="donut"
                                    id="donut"
                                    label="Top foods by calories"
                                    arranging={arranging}
                                  >
                                    <div className="pointer-events-none max-h-32 overflow-hidden opacity-60 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
                                      <CalorieShareDonut foods={displayFoods} onSelect={setSelected} />
                                    </div>
                                  </SortableBlockFrame>
                                );
                              }
                              if (id === "table") {
                                return (
                                  <SortableBlockFrame
                                    key="table"
                                    id="table"
                                    label="Food table"
                                    arranging={arranging}
                                  >
                                    <div className="pointer-events-none max-h-32 overflow-hidden opacity-60 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
                                      {tableNode}
                                    </div>
                                  </SortableBlockFrame>
                                );
                              }
                              return null;
                            })}

                            {/* Sticky bottom bar: Reset (ghost) + Done (primary).
                             * Escape also exits arrange mode. */}
                            <div className="sticky bottom-0 z-30 -mx-4 mt-2 flex items-center justify-between gap-2 border-t bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:-mx-6 lg:px-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={reset}
                                aria-label="Reset Explorer layout to default"
                              >
                                <RotateCcwIcon className="mr-1.5 size-3.5" />
                                Reset layout
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setArranging(false)}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="flex flex-col gap-4 px-4 lg:px-6">
                        {order.map((id) => {
                          if (id === "stats")
                            return <SectionCards key="stats" stats={stats} trend={trend} highDensityTrend={null} prevAvgDensityLoading={prevAvgDensityLoading} />;
                          if (id === "donut")
                            return (
                              <div key="donut">
                                <CalorieShareDonut foods={displayFoods} onSelect={setSelected} />
                              </div>
                            );
                          if (id === "table")
                            return <div key="table">{tableNode}</div>;
                          return null;
                        })}
                      </div>
                    )
                  )}

                  {/* Search & filters — NOT part of the sortable list. Pinned
                   * below the blocks because they scope the table above. */}
                  <div className="px-4 lg:px-6">
                    <Controls search={search} setSearch={setSearch} activeZones={activeZones} setActiveZones={setActiveZones} activeCategories={activeCategories} setActiveCategories={setActiveCategories} />
                  </div>

                  {compareList.length > 0 && (
                    <div className="px-4 lg:px-6">
                      <CompareStrip foods={compareList} onClear={() => setCompareList([])} onRemove={(name) => setCompareList((p) => p.filter((f) => f.name !== name))} />
                    </div>
                  )}

                  {view === "scatter" && (
                    <div className="flex flex-col gap-4 px-4 lg:px-6">
                      <div>
                        <h2 className="text-lg font-semibold">Caloric density vs. portion you eat</h2>
                        <p className="text-sm text-muted-foreground">Y-axis = density (kcal/g) · X-axis = average grams per occasion · Size = frequency</p>
                      </div>
                      <ScatterView foods={filtered} onSelect={setSelected} />
                    </div>
                  )}

                  {view === "ranking" && (
                    <div className="flex flex-col gap-4 px-4 lg:px-6">
                      <div>
                        <h2 className="text-lg font-semibold">Top 30 · Total calories in the month</h2>
                        <p className="text-sm text-muted-foreground">What <em>really</em> dominates your intake — not by density, but by total volume.</p>
                      </div>
                      <RankingView foods={filtered} onSelect={setSelected} />
                    </div>
                  )}

                  {view === "treemap" && (
                    <div className="px-4 lg:px-6">
                      <TreemapView foods={filtered} onSelect={setSelected} />
                    </div>
                  )}
                </div>

                {/* Subtle tint over the blurred preview — a hard visual barrier
                    so no dummy values can be read. pointer-events-none so it
                    never blocks the modal's ImportButton (modal is z-50 via
                    its own portal). */}
                {!hasRealData && (
                  <div
                    className="pointer-events-none absolute inset-0 z-30 bg-background/20"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      <DetailModal food={selected} onClose={() => setSelected(null)} onCompare={(food) => { toggleCompare(food); setSelected(null); }} inCompare={selected ? compareList.some((f) => f.name === selected.name) : false} />

      {/* First-run onboarding: centered walkthrough modal over the blurred
          dashboard. Only mounted once loading is complete AND the user has no
          data — never during a fetch, so a user with data that simply hasn't
          finished loading won't see it. Unmounts immediately once data is
          imported (hasRealData flips). */
      }
      {!loading && !error && !hasRealData && (
        <OnboardingModal
          open={!loading && !error && !hasRealData}
          onImported={(foods) => setFoods(foods)}
        />
      )}
    </SidebarProvider>
  );
}

// --- helpers below this line ---

/**
 * A draggable frame around an Explorer block in arrange mode. When
 * `arranging` is true the whole frame becomes the drag activator; the
 * grip icon in the header is purely an affordance. Listeners go on the
 * frame so clicks on slice swatches / row buttons / etc. in the inert
 * content underneath do not get hijacked — the content is itself
 * pointer-events-none.
 */
function SortableBlockFrame({
  id,
  label,
  arranging,
  children,
}: {
  id: BlockId;
  label: string;
  arranging: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <ExplorerBlockFrame
      ref={setNodeRef}
      style={style}
      label={label}
      arranging={arranging}
      dragging={isDragging}
      gripProps={{ ...attributes, ...listeners }}
    >
      {children}
    </ExplorerBlockFrame>
  );
}
