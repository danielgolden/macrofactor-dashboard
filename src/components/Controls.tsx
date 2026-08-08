"use client";

import { useMemo } from "react";
import { SearchIcon } from "lucide-react";

import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import type { Zone, Category } from "@/lib/types";
import { ZONE_META, CAT_META } from "@/lib/types";

interface FilterOption {
  type: "zone" | "category";
  key: string;
  label: string;
}

interface Props {
  search: string;
  setSearch: (s: string) => void;
  activeZones: Set<Zone>;
  setActiveZones: (s: Set<Zone>) => void;
  activeCategories: Set<Category>;
  setActiveCategories: (s: Set<Category>) => void;
}

export function Controls({
  setSearch,
  activeZones,
  setActiveZones,
  activeCategories,
  setActiveCategories,
}: Props) {
  const zoneOptions = useMemo(
    () =>
      (Object.keys(ZONE_META) as Zone[]).map((k) => ({
        type: "zone" as const,
        key: k,
        label: ZONE_META[k].label,
      })),
    []
  );

  const categoryOptions = useMemo(
    () =>
      (Object.keys(CAT_META) as Category[]).map((k) => ({
        type: "category" as const,
        key: k,
        label: CAT_META[k].label,
      })),
    []
  );

  const selectedFilters = useMemo<FilterOption[]>(() => {
    const zones = Array.from(activeZones).map((k) => ({
      type: "zone" as const,
      key: k,
      label: ZONE_META[k].label,
    }));
    const cats = Array.from(activeCategories).map((k) => ({
      type: "category" as const,
      key: k,
      label: CAT_META[k].label,
    }));
    return [...zones, ...cats];
  }, [activeZones, activeCategories]);

  const handleValueChange = (newValue: FilterOption[]) => {
    const newZones = new Set(
      newValue.filter((v) => v.type === "zone").map((v) => v.key as Zone)
    );
    const newCats = new Set(
      newValue.filter((v) => v.type === "category").map((v) => v.key as Category)
    );
    setActiveZones(newZones);
    setActiveCategories(newCats);
  };

  return (
    <Combobox<FilterOption, true>
      multiple
      value={selectedFilters}
      onValueChange={handleValueChange}
      onInputValueChange={(inputVal) => setSearch(inputVal)}
      itemToStringLabel={(item) => item.label}
      isItemEqualToValue={(a, b) => a.type === b.type && a.key === b.key}
    >
      <ComboboxChips>
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
        {selectedFilters.map((filter) => (
          <ComboboxChip key={`${filter.type}-${filter.key}`}>
            {filter.label}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder="Search foods or filter by zone/macro…" />
      </ComboboxChips>
      <ComboboxContent align="start">
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>Zone</ComboboxLabel>
            {zoneOptions.map((opt) => (
              <ComboboxItem key={opt.key} value={opt}>
                {opt.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxLabel>Macro</ComboboxLabel>
            {categoryOptions.map((opt) => (
              <ComboboxItem key={opt.key} value={opt}>
                {opt.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
