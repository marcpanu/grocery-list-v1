export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type PrepTime = '<30' | '30-60' | '60+';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface RecipeStep {
  order: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  source: {
    type: 'url' | 'manual' | 'image';
    value: string;  // URL, 'manual', or image reference
  };
  imageUrl?: string;
  servings: number;
  prepTime: PrepTime;
  cookTime?: number;  // in minutes
  ingredients: Ingredient[];
  instructions: RecipeStep[];
  
  // Tags and Categories
  mealTypes: MealType[];
  cuisine?: string[];
  nutritionTags?: string[];
  
  // Metadata
  isFavorite: boolean;
  dateAdded: Date;
  lastModified: Date;
  
  // User specific data
  notes?: string;
  rating?: number;  // 1-5
}

// For recipe list views and previews
export interface RecipePreview {
  id: string;
  name: string;
  imageUrl?: string;
  prepTime: PrepTime;
  mealTypes: MealType[];
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