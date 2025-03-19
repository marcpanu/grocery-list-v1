import { Recipe, Ingredient } from '../types/recipe';
import { Timestamp } from 'firebase/firestore';

// Time Processing
export function calculateTotalTime(prepTime?: number, cookTime?: number): number | undefined {
  if (!prepTime && !cookTime) return undefined;
  return (prepTime || 0) + (cookTime || 0);
}

export function calculateDisplayTotalTime(totalTime?: number): string | undefined {
  if (!totalTime) return undefined;
  if (totalTime < 30) return "less than 30 mins";
  if (totalTime <= 60) return "30-60 mins";
  return "more than an hour";
}

// Ingredient Quantity Processing
export function normalizeIngredientQuantity(quantity: string | number): number {
  if (typeof quantity === 'number') return quantity;
  
  // Handle fractions
  if (quantity.includes('/')) {
    const [num, denom] = quantity.split('/').map(Number);
    return num / denom;
  }
  
  // Handle mixed numbers (e.g., "1 1/2")
  const parts = quantity.split(' ');
  if (parts.length === 2 && parts[1].includes('/')) {
    const whole = Number(parts[0]);
    const [num, denom] = parts[1].split('/').map(Number);
    return whole + (num / denom);
  }

  // Try to parse as number, default to 1 if invalid
  const parsed = Number(quantity);
  return isNaN(parsed) ? 1 : parsed;
}

// Cuisine Processing
export function normalizeCuisine(cuisine: string[]): string[] {
  return cuisine
    .map(c => c.trim())
    .filter(c => c.length > 0)
    .map(c => c.replace(/^Other:/, '')); // Remove "Other:" prefix if present
}

// Firestore Data Transformation
export function prepareRecipeForFirestore(recipe: Recipe): any {
  return {
    ...recipe,
    // Convert Date to Timestamp
    dateAdded: Timestamp.fromDate(recipe.dateAdded),
    
    // Process ingredients
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      quantity: normalizeIngredientQuantity(ing.quantity),
      unit: ing.unit || null,
      notes: ing.notes || null
    })),
    
    // Process time fields
    prepTime: recipe.prepTime || null,
    cookTime: recipe.cookTime || null,
    totalTime: calculateTotalTime(recipe.prepTime, recipe.cookTime),
    displayTotalTime: calculateDisplayTotalTime(
      calculateTotalTime(recipe.prepTime, recipe.cookTime)
    ),
    
    // Process cuisine
    cuisine: recipe.cuisine ? normalizeCuisine(recipe.cuisine) : null,
    
    // Handle other optional fields
    description: recipe.description || null,
    imageUrl: recipe.imageUrl || null,
    notes: recipe.notes || null,
    mealTypes: recipe.mealTypes || null,
    rating: recipe.rating || null,
    source: recipe.source || null
  };
}

export function processRecipeFromFirestore(firestoreData: any): Recipe {
  return {
    ...firestoreData,
    // Convert Timestamp to Date
    dateAdded: firestoreData.dateAdded.toDate(),
    
    // Ensure ingredients have proper quantity type
    ingredients: firestoreData.ingredients.map((ing: Ingredient) => ({
      ...ing,
      quantity: Number(ing.quantity) // Ensure number type
    }))
  };
} 