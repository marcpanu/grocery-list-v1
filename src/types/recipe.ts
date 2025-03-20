export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface Ingredient {
  name: string;
  quantity: number | string;
  unit: string | null;
  notes: string | null;
}

export interface RecipeStep {
  order: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  totalTime: number | null;
  displayTotalTime: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  imageUrl: string | null;
  notes: string | null;
  mealTypes: string[] | null;
  cuisine: string[] | null;
  rating: number | null;
  dateAdded: Date;
  isFavorite: boolean;
  source: {
    type: 'url' | 'instagram' | 'tiktok';
    url: string;
    title: string | null;
  } | null;
}

// For recipe list views and previews
export interface RecipePreview {
  id: string;
  name: string;
  imageUrl: string | null;
  displayTotalTime?: string;
  mealTypes: string[] | null;
  cuisine: string[] | null;
  rating: number | null;
  dateAdded: Date;
  isFavorite: boolean;
}

// For form handling
export type RecipeFormData = Omit<Recipe, 'id' | 'dateAdded' | 'totalTime' | 'displayTotalTime'>;

// Helper function to calculate displayTotalTime
export function getDisplayTotalTime(totalTimeInMinutes: number | null | undefined): string {
  if (!totalTimeInMinutes) return "unknown";
  if (totalTimeInMinutes < 30) return "less than 30 mins";
  if (totalTimeInMinutes < 60) return "30-60 mins";
  return "more than an hour";
}

// Nutrition tag constants
export const NUTRITION_TAGS = [
  'high-protein',
  'low-calorie',
  'low-carb',
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'keto',
  'paleo'
] as const;

// Common cuisines
export const CUISINES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Thai',
  'Indian',
  'Mediterranean',
  'French',
  'Greek',
  'Spanish',
  'Korean',
  'Vietnamese'
] as const;

export interface Instruction {
  order: number;
  instruction: string;
}

export interface ParsedRecipe {
  name: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  ingredients: ParsedIngredient[];
  instructions: string[];
  imageUrl?: string;
  cuisine?: string[];
  author?: string;
  source: string;
}

export interface ParsedIngredient {
  original: string;  // Original text
  quantity?: number | string;
  unit?: string;
  name: string;
  notes?: string;
}

export interface RecipeParseError {
  message: string;
  code: 'UNSUPPORTED_SITE' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'AUTH_REQUIRED';
  details?: any;
} 