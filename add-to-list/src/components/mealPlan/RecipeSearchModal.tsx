import { useState, useEffect } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Recipe, RecipePreview } from '../../types/recipe';
import { getAllRecipes, getRecipe } from '../../firebase/firestore';

interface RecipeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}

export default function RecipeSearchModal({ isOpen, onClose, onSelect }: RecipeSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const recipePreviews = await getAllRecipes();
        setRecipes(recipePreviews);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
        setError('Failed to load recipes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchRecipes();
    } else {
      // Clear state when modal closes
      setSearchQuery('');
      setRecipes([]);
      setError(null);
    }
  }, [isOpen]);

  const handleRecipeSelect = async (preview: RecipePreview) => {
    try {
      setIsLoadingRecipe(true);
      setError(null);
      const fullRecipe = await getRecipe(preview.id);
      if (fullRecipe) {
        onSelect(fullRecipe);
      } else {
        setError('Failed to load recipe details. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch recipe details:', error);
      setError('Failed to load recipe details. Please try again.');
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      recipe.name.toLowerCase().includes(searchLower) ||
      recipe.mealTypes.some(type => type.toLowerCase().includes(searchLower)) ||
      (recipe.cuisine?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Search Recipes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoadingRecipe}
          >
            <Cross2Icon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading || isLoadingRecipe}
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            {searchQuery ? 'No recipes found matching your search' : 'No recipes available'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`border rounded-lg p-4 ${
                  isLoadingRecipe 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50 cursor-pointer'
                }`}
                onClick={() => !isLoadingRecipe && handleRecipeSelect(recipe)}
              >
                <h3 className="font-semibold">{recipe.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recipe.mealTypes.map(type => (
                    <span key={type} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {type}
                    </span>
                  ))}
                  {recipe.cuisine && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {recipe.cuisine}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoadingRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 