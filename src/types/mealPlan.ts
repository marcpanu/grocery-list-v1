import { Ingredient } from './recipe';

// Define a type for meal times in meal planning
export type MealPlanMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface Meal {
  id: string;
  name: string;
  description?: string;
  mealPlanMeal: MealPlanMealType; // Changed from 'type: MealType' to separate concerns
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

export interface AddMealData {
  name: string;
  description?: string;
  mealTypes: string[];
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
}