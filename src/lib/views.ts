import { ChartColumnIcon, ChartScatterIcon, LayoutGridIcon, TableIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ViewDef {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const VIEWS: ViewDef[] = [
  { id: "explorer", label: "Explorador", icon: TableIcon },
  { id: "scatter", label: "Densidad vs Porción", icon: ChartScatterIcon },
  { id: "ranking", label: "Ranking Mensual", icon: ChartColumnIcon },
  { id: "treemap", label: "Mapa de Calorías", icon: LayoutGridIcon },
];

export type ViewId = "explorer" | "scatter" | "ranking" | "treemap";
