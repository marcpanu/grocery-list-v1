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
    description: parsedRecipe.description,
    prepTime: parsedRecipe.prepTime ?? '30-60',
    cookTime: parsedRecipe.cookTime,
    totalTime: parsedRecipe.totalTime,
    servings: parsedRecipe.servings ?? 4,
    ingredients: parsedRecipe.ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.quantity ?? 0,
      unit: ing.unit,
      notes: ing.notes,
    })),
    instructions: parsedRecipe.instructions.map((instruction, index) => ({
      order: index + 1,
      instruction: instruction ?? '',
    })),
    imageUrl: parsedRecipe.imageUrl,
    notes: `Imported from: ${parsedRecipe.source}${parsedRecipe.author ? `\nAuthor: ${parsedRecipe.author}` : ''}`,
    mealTypes: [],  // To be set by user
    cuisine: parsedRecipe.cuisine ?? [],
    dateAdded: new Date(),
    isFavorite: false,
    rating: undefined,
  };

  // Add the recipe to Firestore
  const addedRecipe = await addRecipe(recipe);

  return { recipe: addedRecipe };
} 