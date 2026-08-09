"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon, PlusIcon, CheckIcon, FlameIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Food, Zone } from "@/lib/types";
import { ZONE_META } from "@/lib/types";

const MAX_DENSITY = 8;

const ZONE_BADGE_VARIANT: Record<Zone, "default" | "secondary" | "destructive" | "success"> = {
  low: "secondary",
  medium: "success",
  high: "destructive",
};

interface Props {
  foods: Food[];
  compareList: Food[];
  toggleCompare: (food: Food) => void;
  onSelect: (food: Food) => void;
}

export function ExplorerView({ foods, compareList, toggleCompare, onSelect }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "totalCalories", desc: true },
  ]);

  const columns = useMemo<ColumnDef<Food>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {String(row.index + 1).padStart(3, "0")}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: "Food",
        cell: ({ row }) => (
          <FoodNameCell name={row.original.name} onSelect={() => onSelect(row.original)} />
        ),
      },
      {
        accessorKey: "calDensity",
        header: "Density",
        cell: ({ row }) => {
          const food = row.original;
          const z = ZONE_META[food.zone];
          const widthPct = Math.min(100, (food.calDensity / MAX_DENSITY) * 100);
          return (
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-20 overflow-hidden rounded-sm bg-muted sm:w-28">
                <div
                  className="absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: `${widthPct}%`, backgroundColor: z.fill }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums">
                {food.calDensity.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">kcal/g</span>
            </div>
          );
        },
      },
      {
        accessorKey: "totalCalories",
        header: () => (
          <span className="inline-flex items-center gap-1">
            <FlameIcon className="size-3" />
            consumed
          </span>
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.totalCalories.toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "zone",
        header: "Zone",
        cell: ({ row }) => {
          const z = ZONE_META[row.original.zone];
          return (
            <Badge variant={ZONE_BADGE_VARIANT[row.original.zone]}>
              {z.label}
            </Badge>
          );
        },
      },
      {
        id: "compare",
        header: "",
        cell: ({ row }) => {
          const inComp = compareList.some((f) => f.name === row.original.name);
          return (
            <Button
              variant={inComp ? "default" : "outline"}
              size="sm"
              className="h-9 px-2 text-xs sm:h-7"
              onClick={() => toggleCompare(row.original)}
            >
              {inComp ? <CheckIcon className="size-3" /> : <PlusIcon className="size-3" />}
              cmp
            </Button>
          );
        },
        enableSorting: false,
      },
    ],
    [compareList, toggleCompare, onSelect]
  );

  const table = useReactTable({
    data: foods,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {foods.length} foods
        </span>
      </div>

      <div className="min-w-0 overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      (header.column.id === "index" || header.column.id === "zone") &&
                        "hidden sm:table-cell"
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() && "cursor-pointer hover:text-foreground"
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ArrowUpDownIcon className="size-3 opacity-50" />
                        )}
                      </button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onSelect(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        (cell.column.id === "index" || cell.column.id === "zone") &&
                          "hidden sm:table-cell"
                      )}
                      onClick={(e) => {
                        if (cell.column.id === "compare" || cell.column.id === "name") {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No foods found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FoodNameCell({ name, onSelect }: { name: string; onSelect: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  const handleMouseEnter = () => {
    const el = ref.current;
    if (el) setTruncated(el.scrollWidth > el.clientWidth);
  };

  const content = (
    <span
      ref={ref}
      onMouseEnter={handleMouseEnter}
      className="block max-w-[140px] truncate text-left font-medium sm:max-w-[300px]"
    >
      {name}
    </span>
  );

  return (
    <TooltipProvider delay={350}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                onSelect();
              }}
              className="flex h-full w-full items-center text-left"
            />
          }
        >
          {content}
        </TooltipTrigger>
        {truncated && (
          <TooltipContent side="top" className="max-w-sm">
            {name}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
