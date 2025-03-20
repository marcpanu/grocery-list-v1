import { parseRecipeUrl } from './recipeParser';
import { addRecipe } from '../firebase/firestore';
import { Recipe } from '../types/recipe';

export async function importRecipeFromUrl(data: { 
  url: string;
}): Promise<{ recipe: Recipe }> {
  // Parse the recipe from the URL
  const parsedRecipe = await parseRecipeUrl(data.url);

  // Convert parsed recipe to our Recipe format, handling all optional fields
  const recipe: Omit<Recipe, 'id'> = {
    name: parsedRecipe.name,
    description: parsedRecipe.description || null,
    prepTime: parsedRecipe.prepTime || '<30',
    cookTime: parsedRecipe.cookTime || null,
    totalTime: parsedRecipe.totalTime || null,
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