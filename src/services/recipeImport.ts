import { parseRecipeUrl } from './recipeParser';
import { addRecipe } from '../firebase/firestore';
import { Recipe, getDisplayTotalTime } from '../types/recipe';

// Helper function to convert time string to minutes
function convertTimeToMinutes(timeStr: string | number | undefined): number | null {
  if (timeStr === undefined || timeStr === null) return null;
  
  if (typeof timeStr === 'number') return timeStr;
  
  // Handle our old format strings
  if (timeStr === '<30') return 15; // Approximation
  if (timeStr === '30-60') return 45; // Approximation
  if (timeStr === '60+') return 90; // Approximation
  
  // Try to parse a numeric value
  const minutes = parseInt(timeStr, 10);
  return isNaN(minutes) ? null : minutes;
}

export async function importRecipeFromUrl(data: { 
  url: string;
}): Promise<{ recipe: Recipe }> {
  // Parse the recipe from the URL
  const parsedRecipe = await parseRecipeUrl(data.url);

  // Convert time values to minutes
  const prepTime = convertTimeToMinutes(parsedRecipe.prepTime) || 15; // Default to 15 mins
  const cookTime = convertTimeToMinutes(parsedRecipe.cookTime);
  
  // Calculate totalTime
  const totalTime = (prepTime || 0) + (cookTime || 0);
  
  // Generate displayTotalTime
  const displayTotalTime = getDisplayTotalTime(totalTime);

  // Convert parsed recipe to our Recipe format, handling all optional fields
  const recipe: Omit<Recipe, 'id'> = {
    name: parsedRecipe.name,
    description: parsedRecipe.description || null,
    prepTime,
    cookTime,
    totalTime,
    displayTotalTime,
    servings: parsedRecipe.servings || 4,
    ingredients: parsedRecipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.quantity || '',
      unit: ing.unit || null,
      notes: ing.notes || null
    })),
    instructions: parsedRecipe.instructions.map((inst, index) => ({
      order: index + 1,
      instruction: inst
    })),
    imageUrl: parsedRecipe.imageUrl || null,
    notes: parsedRecipe.author ? `Author: ${parsedRecipe.author}` : null,
    mealTypes: ['dinner'],
    cuisine: parsedRecipe.cuisine || [],
    rating: null,
    dateAdded: new Date(),
    isFavorite: false,
    source: {
      type: 'url',
      url: parsedRecipe.source,
      title: null
    }
  };

  // Add the recipe to Firestore
  const addedRecipe = await addRecipe(recipe);

  return { recipe: addedRecipe };
} 