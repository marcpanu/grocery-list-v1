import { Ingredient } from './recipe';

// Define a type for meal times in meal planning
export type MealPlanMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface Meal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  mealPlanMeal: MealPlanMealType; // Changed from 'type: MealType' to separate concerns
  days: string[];
  weekId: string;
  servings: number;
  recipeId?: string;
  createdAt: Date;
}

export interface Week {
  id: string;
  userId: string;
  startDate: string;       // ISO date string of the week's first day
  endDate: string;         // ISO date string of the week's last day
  label?: string;          // Optional user-friendly name
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlan {
  id: string;
  userId: string;
  weeks: Week[];           // List of weeks in this meal plan
  currentWeekId: string;   // Track active week
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyTemplate {
  id: string;
  name: string;
  meals: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface AddMealData {
  name: string;
  description?: string;
  mealTypes?: string[];
  servings: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients?: Ingredient[];
  instructions?: string[];
  cuisine?: string[];
  rating?: number;
  recipeId?: string;
  days?: string[];
  mealPlanMeal?: MealPlanMealType;
  weekId?: string;
}