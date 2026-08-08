"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  const handleZonesChange = (vals: string[]) => {
    const next = new Set(vals as Zone[]);
    (Object.keys(ZONE_META) as Zone[]).forEach((z) => {
      if (activeZones.has(z) !== next.has(z)) toggleZone(z);
    });
  };

  const handleCategoriesChange = (vals: string[]) => {
    const next = new Set(vals as Category[]);
    (Object.keys(CAT_META) as Category[]).forEach((c) => {
      if (activeCategories.has(c) !== next.has(c)) toggleCategory(c);
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Search */}
      <div className="min-w-56 flex-1">
        <Label htmlFor="food-search" className="mb-1.5">Buscar</Label>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="food-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ej. banana, cottage, eggs..."
            className="pl-8 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Zone filters */}
      <div>
        <Label className="mb-1.5">Zona</Label>
        <ToggleGroup
          multiple
          variant="outline"
          value={Array.from(activeZones)}
          onValueChange={handleZonesChange}
        >
          {(Object.keys(ZONE_META) as Zone[]).map((k) => (
            <ToggleGroupItem key={k} value={k}>
              {ZONE_META[k].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* Category filters */}
      <div>
        <Label className="mb-1.5">Macro</Label>
        <ToggleGroup
          multiple
          variant="outline"
          value={Array.from(activeCategories)}
          onValueChange={handleCategoriesChange}
        >
          {(Object.keys(CAT_META) as Category[]).map((k) => (
            <ToggleGroupItem key={k} value={k}>
              {CAT_META[k].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
