import * as XLSX from 'xlsx';
import type { DailyEntry, FoodEntry, MacroFactorData } from '../types';

function parseDate(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(raw);
    const y = date.y;
    const m = String(date.m).padStart(2, '0');
    const d = String(date.d).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof raw === 'string') {
    // Try to normalize various formats
    const match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const [, m, d, y] = match;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    // Already ISO-ish
    return raw.split('T')[0];
  }
  return String(raw);
}

function num(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parseDailySummary(sheet: XLSX.WorkSheet): DailyEntry[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return rows
    .map((row) => {
      const date = parseDate(row['Date'] ?? row['date']);
      if (!date) return null;
      return {
        date,
        calories: num(row['Calories (kcal)']),
        targetCalories: num(row['Target Calories (kcal)']),
        protein: num(row['Protein (g)']),
        targetProtein: num(row['Target Protein (g)']),
        fat: num(row['Fat (g)']),
        targetFat: num(row['Target Fat (g)']),
        carbs: num(row['Carbs (g)']),
        targetCarbs: num(row['Target Carbs (g)']),
        expenditure: num(row['Expenditure']),
        trendWeight: num(row['Trend Weight (lbs)']),
        weight: num(row['Weight (lbs)']),
        steps: num(row['Steps']),
        fiber: num(row['Fiber (g)']) || num(row['Fiber']),
        sodium: num(row['Sodium (mg)']) || num(row['Sodium']),
        vitaminD: num(row['Vitamin D (mcg)']) || num(row['Vitamin D (IU)']) || num(row['Vitamin D']),
        calcium: num(row['Calcium (mg)']) || num(row['Calcium']),
        iron: num(row['Iron (mg)']) || num(row['Iron']),
        potassium: num(row['Potassium (mg)']) || num(row['Potassium']),
        vitaminC: num(row['Vitamin C (mg)']) || num(row['Vitamin C']),
        vitaminA: num(row['Vitamin A (mcg)']) || num(row['Vitamin A (IU)']) || num(row['Vitamin A']),
        saturatedFat: num(row['Saturated Fat (g)']) || num(row['Saturated Fat']),
        cholesterol: num(row['Cholesterol (mg)']) || num(row['Cholesterol']),
        sugar: num(row['Sugar (g)']) || num(row['Sugar']),
      } as DailyEntry;
    })
    .filter((e): e is DailyEntry => e !== null && e.date !== '');
}

function parseFoodLog(sheet: XLSX.WorkSheet): FoodEntry[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return rows
    .map((row) => {
      const date = parseDate(row['Date'] ?? row['date']);
      if (!date) return null;
      return {
        date,
        time: String(row['Time'] ?? row['time'] ?? ''),
        foodName: String(row['Food Name'] ?? row['food_name'] ?? ''),
        servingWeight: num(row['Serving Weight (g)']),
        calories: num(row['Calories (kcal)']),
        protein: num(row['Protein (g)']),
        fat: num(row['Fat (g)']),
        carbs: num(row['Carbs (g)']),
        fiber: num(row['Fiber (g)']) || num(row['Fiber']),
        sodium: num(row['Sodium (mg)']) || num(row['Sodium']),
      } as FoodEntry;
    })
    .filter((e): e is FoodEntry => e !== null && e.date !== '' && e.foodName !== '');
}

export function parseXlsx(file: File): Promise<MacroFactorData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Find the Quick Export sheet (first or named)
        const dailySheetName =
          workbook.SheetNames.find((n) =>
            n.toLowerCase().includes('quick') || n.toLowerCase().includes('daily')
          ) ?? workbook.SheetNames[0];

        const foodSheetName =
          workbook.SheetNames.find((n) =>
            n.toLowerCase().includes('food') || n.toLowerCase().includes('log')
          ) ?? workbook.SheetNames[1];

        const dailySummary = parseDailySummary(workbook.Sheets[dailySheetName]);
        const foodLog = foodSheetName ? parseFoodLog(workbook.Sheets[foodSheetName]) : [];

        resolve({
          dailySummary,
          foodLog,
          uploadedAt: new Date().toISOString(),
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
