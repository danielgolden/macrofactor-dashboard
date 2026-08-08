"use client";

import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Food } from "@/lib/types";
import { ZONE_META, CAT_META } from "@/lib/types";

interface Props {
  foods: Food[];
  onClear: () => void;
  onRemove: (name: string) => void;
}

function CompareCard({ food, onRemove }: { food: Food; onRemove: () => void }) {
  const z = ZONE_META[food.zone];
  const cat = CAT_META[food.category];
  return (
    <div className="relative rounded-lg border p-3">
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
        aria-label="Remove"
      >
        <XIcon className="size-4" />
      </button>
      <div className="mb-1 flex gap-1.5">
        <Badge variant="secondary" style={{ backgroundColor: z.fill, color: "#fff" }}>{z.label}</Badge>
        <Badge variant="outline" style={{ color: cat.color, borderColor: cat.color }}>{cat.label}</Badge>
      </div>
      <div className="mb-2 pr-6 text-sm font-semibold leading-tight">{food.name}</div>
      <div className="text-2xl font-bold tabular-nums">
        {food.calDensity.toFixed(2)}
        <span className="ml-1 text-xs font-normal text-muted-foreground">kcal/g</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        P {food.proteinPer100g.toFixed(1)} · C {food.carbPer100g.toFixed(1)} · F {food.fatPer100g.toFixed(1)}{" "}
        <span className="opacity-70">per 100g</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground tabular-nums">
        {food.totalCalories.toLocaleString()} kcal · {food.timesEaten}×
      </div>
    </div>
  );
}

export function CompareStrip({ foods, onClear, onRemove }: Props) {
  const [a, b] = foods;
  if (!a) return null;
  const ratio = b ? Math.max(a.calDensity, b.calDensity) / Math.min(a.calDensity, b.calDensity) : null;
  const heavier = b ? (a.calDensity > b.calDensity ? a : b) : null;
  const lighter = b ? (a.calDensity > b.calDensity ? b : a) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Comparison</CardTitle>
        <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={onClear}>
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className={`grid items-center gap-4 ${b ? "grid-cols-1 sm:grid-cols-[1fr_auto_1fr]" : "grid-cols-1"}`}>
          <CompareCard food={a} onRemove={() => onRemove(a.name)} />
          {b && (
            <>
              <div className="text-center">
                <div className="text-xl font-bold italic">{ratio!.toFixed(1)}×</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">difference</div>
              </div>
              <CompareCard food={b} onRemove={() => onRemove(b.name)} />
            </>
          )}
        </div>
        {b && heavier && lighter && (
          <div className="mt-4 border-t pt-3 text-sm leading-relaxed text-muted-foreground">
            For the calories in <strong className="text-foreground">100g of {heavier.name}</strong> ({Math.round(heavier.calDensity * 100)} kcal),
            you need <strong className="text-foreground">{Math.round(ratio! * 100)}g of {lighter.name}</strong>.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
