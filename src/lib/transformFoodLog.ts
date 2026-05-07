import * as XLSX from "xlsx";
import type { Food } from "./types";
import { aggregateEntries, type LogEntry } from "./aggregateEntries";

interface RawRow {
  "Date"?: string;
  "Food Name"?: string;
  "Serving Qty"?: number | string;
  "Serving Weight (g)"?: number | string;
  "Calories (kcal)"?: number | string;
  "Protein (g)"?: number | string;
  "Fat (g)"?: number | string;
  "Carbs (g)"?: number | string;
  [key: string]: unknown;
}

function fixCsvQuotes(text: string): string {
  // MacroFactor CSV has unescaped " in food names (e.g. '0" Raw').
  // A rogue quote is one preceded and followed by non-delimiter chars.
  return text.replace(/([^,\n\r"])"(?=[^,\n\r"])/g, '$1""');
}

export function transformFoodLog(buffer: Buffer, filename = ""): { foods: Food[]; entries: LogEntry[] } {
  const isCSV = filename.toLowerCase().endsWith(".csv");
  const workbook = isCSV
    ? XLSX.read(fixCsvQuotes(buffer.toString("utf-8")), { type: "string" })
    : XLSX.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames.includes("Food Log")
    ? "Food Log"
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  const rawRows: RawRow[] = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });

  // Normalize headers: trim whitespace and strip surrounding quotes
  const rows: RawRow[] = rawRows.map((row) => {
    const normalized: RawRow = {};
    for (const key of Object.keys(row)) {
      const cleanKey = key.trim().replace(/^"+|"+$/g, "");
      (normalized as Record<string, unknown>)[cleanKey] = row[key];
    }
    return normalized;
  });

  const entries: LogEntry[] = [];

  for (const row of rows) {
    const name = String(row["Food Name"] ?? "").trim();
    if (!name) continue;

    const qty = Number(row["Serving Qty"]);
    const weight = Number(row["Serving Weight (g)"]);
    const portionWeight = qty * weight;

    if (!portionWeight || portionWeight <= 0) continue;

    const rawDate = String(row["Date"] ?? "").trim();
    if (!rawDate) continue;

    // Normalize date to YYYY-MM-DD
    // MacroFactor exports: M/D/YY (all-time), MM/DD/YYYY (monthly), or YYYY-MM-DD
    let date = rawDate;
    if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(rawDate)) {
      const [m, d, y] = rawDate.split("/");
      date = `20${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
      const [m, d, y] = rawDate.split("/");
      date = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    entries.push({
      date,
      foodName: name,
      weightG: portionWeight,
      calories: Number(row["Calories (kcal)"]) || 0,
      fatG: Number(row["Fat (g)"]) || 0,
      carbsG: Number(row["Carbs (g)"]) || 0,
      proteinG: Number(row["Protein (g)"]) || 0,
    });
  }

  const foods = aggregateEntries(entries);

  return { foods, entries };
}
