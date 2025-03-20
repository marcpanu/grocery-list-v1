import { MealType } from './recipe';

// Define a reused type for meal plan meal slots
export type MealPlanMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface Meal {
  id: string;
  name: string;
  description?: string;
  mealPlanMeal: MealPlanMealType; // Renamed from 'type' to clarify purpose
  days: string[];
  servings: number;
  recipeId?: string;
  createdAt: Date;
}

export interface MealPlan {
  id: string;
  userId: string;
  meals: Meal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyTemplate {
  id: string;
  name: string;
  meals: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>[];
} 