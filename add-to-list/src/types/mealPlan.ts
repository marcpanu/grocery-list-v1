import { MealType } from './recipe';

export interface Meal {
  id: string;
  name: string;
  description?: string;
  type: MealType;
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