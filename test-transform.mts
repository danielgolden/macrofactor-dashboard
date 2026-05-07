import * as XLSX from "xlsx";
import { transformFoodLog } from "./src/lib/transformFoodLog";

// Crear xlsx de prueba con estructura MacroFactor
const rows = [
  { "Food Name": "Pollo a la plancha", "Serving Qty": 1, "Serving Weight (g)": 150, "Calories": 248, "Protein (g)": 46, "Fat (g)": 5.4, "Carbohydrates (g)": 0 },
  { "Food Name": "Arroz blanco",       "Serving Qty": 1, "Serving Weight (g)": 200, "Calories": 260, "Protein (g)": 5,  "Fat (g)": 0.4, "Carbohydrates (g)": 57 },
  { "Food Name": "Pollo a la plancha", "Serving Qty": 1, "Serving Weight (g)": 130, "Calories": 215, "Protein (g)": 40, "Fat (g)": 4.7, "Carbohydrates (g)": 0 },
  { "Food Name": "Aceite de oliva",    "Serving Qty": 1, "Serving Weight (g)": 10,  "Calories": 88,  "Protein (g)": 0,  "Fat (g)": 10,  "Carbohydrates (g)": 0 },
  { "Food Name": "Arroz blanco",       "Serving Qty": 0.5, "Serving Weight (g)": 200, "Calories": 130, "Protein (g)": 2.5, "Fat (g)": 0.2, "Carbohydrates (g)": 28.5 },
  // Fila vacía — debe filtrarse
  { "Food Name": "", "Serving Qty": 1, "Serving Weight (g)": 100, "Calories": 100, "Protein (g)": 5, "Fat (g)": 5, "Carbohydrates (g)": 5 },
];

const ws = XLSX.utils.json_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Food Log");
const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

const foods = transformFoodLog(buf);

console.log(`\nAlimentos procesados: ${foods.length} (esperado: 3)\n`);

for (const f of foods) {
  console.log(`--- ${f.name} ---`);
  console.log(`  timesEaten:     ${f.timesEaten}`);
  console.log(`  totalWeight:    ${f.totalWeight}g`);
  console.log(`  totalCalories:  ${f.totalCalories} kcal`);
  console.log(`  calDensity:     ${f.calDensity} kcal/g`);
  console.log(`  proteinPer100g: ${f.proteinPer100g}g`);
  console.log(`  fatPer100g:     ${f.fatPer100g}g`);
  console.log(`  carbPer100g:    ${f.carbPer100g}g`);
  console.log(`  category:       ${f.category}`);
  console.log(`  zone:           ${f.zone}`);
  console.log(`  avgPortion:     ${f.avgPortion}g`);
}

// Verificaciones
const pollo = foods.find(f => f.name === "Pollo a la plancha")!;
const arroz = foods.find(f => f.name === "Arroz blanco")!;
const aceite = foods.find(f => f.name === "Aceite de oliva")!;

let ok = true;
function check(label: string, got: unknown, expected: unknown) {
  const pass = got === expected;
  console.log(`\n${pass ? "✓" : "✗"} ${label}: got=${got} expected=${expected}`);
  if (!pass) ok = false;
}

check("Pollo timesEaten",   pollo.timesEaten,   2);
check("Pollo totalWeight",  pollo.totalWeight,  280);
check("Pollo totalCalories", pollo.totalCalories, 463);
check("Arroz timesEaten",   arroz.timesEaten,   2);
check("Arroz totalWeight",  arroz.totalWeight,  300);  // 200 + 0.5*200
check("Aceite category",    aceite.category,    "fat");
check("Pollo category",     pollo.category,     "protein");
check("Arroz category",     arroz.category,     "carb");

console.log(`\n${ok ? "✅ Todas las verificaciones pasaron" : "❌ Hay fallos"}`);
