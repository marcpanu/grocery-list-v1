export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type PrepTime = '<30' | '30-60' | '60+';

export interface Ingredient {
  name: string;
  quantity: number;
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
  description?: string;
  prepTime?: number;        // in minutes
  cookTime?: number;        // in minutes
  totalTime?: number;       // calculated: prepTime + cookTime
  displayTotalTime?: string; // calculated: "less than 30 mins" | "30-60 mins" | "more than an hour"
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  imageUrl?: string;
  notes?: string;
  mealTypes?: string[];
  cuisine?: string[];      // standardized array, no "Other:" prefix
  rating?: number;
  dateAdded: Date;
  isFavorite: boolean;
  source?: {
    type: 'url' | 'instagram' | 'tiktok';
    url: string;
    title: string | null;
  };
}

// For recipe list views and previews
export interface RecipePreview {
  id: string;
  name: string;
  imageUrl: string | null;
  prepTime: string;
  mealTypes: string[];
  cuisine: string | null;
  rating: number | null;
  dateAdded: Date;
  isFavorite: boolean;
}

// For form handling
export type RecipeFormData = Omit<Recipe, 'id' | 'dateAdded' | 'lastModified'>;

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
  prepTime?: number;  // in minutes
  cookTime?: number;  // in minutes
  servings: number;
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