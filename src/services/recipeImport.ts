import { parseRecipeUrl } from './recipeParser';
import { addRecipe } from '../firebase/firestore';
import { Recipe } from '../types/recipe';
import { normalizeIngredientQuantity } from '../utils/recipeProcessing';

export async function importRecipeFromUrl(data: { 
  url: string;
}): Promise<{ recipe: Recipe }> {
  // Parse the recipe from the URL
  const parsedRecipe = await parseRecipeUrl(data.url);

  // Convert parsed recipe to our Recipe format
  const recipe: Omit<Recipe, 'id'> = {
    name: parsedRecipe.name,
    description: parsedRecipe.description || undefined,
    prepTime: parsedRecipe.prepTime ? parseInt(parsedRecipe.prepTime) : undefined,
    cookTime: parsedRecipe.cookTime ? parseInt(parsedRecipe.cookTime) : undefined,
    servings: parsedRecipe.servings || 4,
    ingredients: parsedRecipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: normalizeIngredientQuantity(ing.quantity || '1'),
      unit: ing.unit || null,
      notes: ing.notes || null
    })),
    instructions: parsedRecipe.instructions.map((inst, index) => ({
      order: index + 1,
      instruction: inst
    })),
    imageUrl: parsedRecipe.imageUrl || undefined,
    notes: parsedRecipe.author ? `Author: ${parsedRecipe.author}` : undefined,
    mealTypes: ['dinner'],
    cuisine: parsedRecipe.cuisine || undefined,
    rating: undefined,
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