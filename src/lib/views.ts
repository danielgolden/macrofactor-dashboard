import { ChartColumnIcon, ChartScatterIcon, LayoutGridIcon, TableIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ViewDef {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const VIEWS: ViewDef[] = [
  { id: "explorer", label: "Explorer", icon: TableIcon },
  { id: "scatter", label: "Density vs Portion", icon: ChartScatterIcon },
  { id: "ranking", label: "Monthly Ranking", icon: ChartColumnIcon },
  { id: "treemap", label: "Calorie Map", icon: LayoutGridIcon },
];

export type ViewId = "explorer" | "scatter" | "ranking" | "treemap";
