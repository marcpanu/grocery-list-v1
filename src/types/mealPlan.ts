export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface MealPlan {
  id: string;
  weekStartDate: Date;
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  recipeId?: string; // Reference to recipe if it exists
  type: MealType;
  days: string[]; // ISO date strings
  servings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyTemplate {
  id: string;
  name: string;
  meals: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>[];
} 