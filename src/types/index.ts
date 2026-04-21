export interface DailyEntry {
  date: string; // ISO date string YYYY-MM-DD
  calories: number;
  targetCalories: number;
  protein: number;
  targetProtein: number;
  fat: number;
  targetFat: number;
  carbs: number;
  targetCarbs: number;
  expenditure: number;
  trendWeight: number;
  weight: number;
  steps: number;
  // Micronutrients
  fiber?: number;
  sodium?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  vitaminC?: number;
  vitaminA?: number;
  saturatedFat?: number;
  cholesterol?: number;
  sugar?: number;
}

export interface FoodEntry {
  date: string;
  time: string;
  foodName: string;
  servingWeight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sodium?: number;
}

export interface FoodDensityEntry {
  foodName: string;
  timesLogged: number;
  totalCalories: number;
  totalWeight: number;
  avgCaloriesPerServing: number;
  caloricDensity: number; // kcal/g
}

export interface GoalStatus {
  date: string;
  caloriesMet: boolean;
  proteinMet: boolean;
  bothMet: boolean;
}

export interface MacroFactorData {
  dailySummary: DailyEntry[];
  foodLog: FoodEntry[];
  uploadedAt: string;
}

export interface WeeklyAggregate {
  weekLabel: string;
  avgCalories: number;
  avgTargetCalories: number;
  avgProtein: number;
  avgTargetProtein: number;
  avgFat: number;
  avgTargetFat: number;
  avgCarbs: number;
  avgTargetCarbs: number;
}
