import { Recipe, RecipePreview } from '../types/recipe';

interface ImportUrlOptions {
  url: string;
  username?: string;
  password?: string;
}

interface ImportResponse {
  recipe: RecipePreview;
  message?: string;
}

const convertToPreview = (recipe: Recipe): RecipePreview => {
  return {
    id: recipe.id,
    name: recipe.name,
    imageUrl: recipe.imageUrl,
    prepTime: recipe.prepTime,
    mealTypes: recipe.mealTypes,
    cuisine: Array.isArray(recipe.cuisine) ? recipe.cuisine[0] : undefined,
    rating: recipe.rating,
    isFavorite: false,
    dateAdded: recipe.dateAdded.toDate(),
  };
};

export const importRecipeFromUrl = async (options: ImportUrlOptions): Promise<ImportResponse> => {
  const response = await fetch('/api/recipes/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to import recipe');
  }

  const { recipe } = await response.json();
  return {
    recipe: convertToPreview(recipe),
    message: 'Recipe imported successfully',
  };
}; 