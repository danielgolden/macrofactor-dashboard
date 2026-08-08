"use client";

import { useMemo, useRef, useState } from "react";
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
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const chipsRef = useRef<HTMLDivElement | null>(null);

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

  const matchingZones = useMemo(() => {
    const q = inputValue.toLowerCase().trim();
    if (!q) return [];
    return zoneOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [inputValue, zoneOptions]);

  const matchingCategories = useMemo(() => {
    const q = inputValue.toLowerCase().trim();
    if (!q) return [];
    return categoryOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [inputValue, categoryOptions]);

  const handleValueChange = (newValue: FilterOption[]) => {
    const newZones = new Set(
      newValue.filter((v) => v.type === "zone").map((v) => v.key as Zone)
    );
    const newCats = new Set(
      newValue.filter((v) => v.type === "category").map((v) => v.key as Category)
    );
    setActiveZones(newZones);
    setActiveCategories(newCats);
    setInputValue("");
    setSearch("");
    setOpen(false);
  };

  const handleInputValueChange = (
    val: string,
    details: { reason: string }
  ) => {
    if (details.reason !== "input-change") return;
    setInputValue(val);
    setSearch(val);
    const q = val.toLowerCase().trim();
    if (!q) {
      setOpen(false);
      return;
    }
    const hasZoneMatch = zoneOptions.some((opt) =>
      opt.label.toLowerCase().includes(q)
    );
    const hasCatMatch = categoryOptions.some((opt) =>
      opt.label.toLowerCase().includes(q)
    );
    setOpen(hasZoneMatch || hasCatMatch);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setOpen(false);
  };

  return (
    <Combobox<FilterOption, true>
      multiple
      filter={null}
      open={open}
      onOpenChange={handleOpenChange}
      openOnInputClick={false}
      inputValue={inputValue}
      onInputValueChange={handleInputValueChange}
      value={selectedFilters}
      onValueChange={handleValueChange}
      itemToStringLabel={(item) => item.label}
      isItemEqualToValue={(a, b) => a.type === b.type && a.key === b.key}
    >
      <ComboboxChips ref={chipsRef}>
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
        {selectedFilters.map((filter) => (
          <ComboboxChip key={`${filter.type}-${filter.key}`}>
            {filter.label}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          placeholder="Search foods or filter by zone/macro…"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setOpen(false);
              e.currentTarget.blur();
            }
          }}
        />
      </ComboboxChips>
      <ComboboxContent align="start" anchor={chipsRef} className="min-w-(--anchor-width)">
        <ComboboxList>
          {matchingZones.length > 0 && (
            <ComboboxGroup>
              <ComboboxLabel>Zone</ComboboxLabel>
              {matchingZones.map((opt) => (
                <ComboboxItem key={opt.key} value={opt}>
                  {opt.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
          {matchingZones.length > 0 && matchingCategories.length > 0 && (
            <ComboboxSeparator />
          )}
          {matchingCategories.length > 0 && (
            <ComboboxGroup>
              <ComboboxLabel>Macro</ComboboxLabel>
              {matchingCategories.map((opt) => (
                <ComboboxItem key={opt.key} value={opt}>
                  {opt.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
