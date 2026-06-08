export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  notes?: string;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface MealFormData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  notes: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionScore {
  overall: number;
  protein: number;
  metabolic: number;
  bodyComposition: number;
  foodQuality: number;
  recommendations: string[];
}
