import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { RecipePreview } from '../../types/recipe';
import { RecipeCard } from './RecipeCard';
import { getAllRecipes, toggleRecipeFavorite } from '../../firebase/firestore';

interface RecipeListProps {
  onRecipeSelect: (id: string) => void;
}

export const RecipeList = ({ onRecipeSelect }: RecipeListProps) => {
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const fetchedRecipes = await getAllRecipes();
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    try {
      await toggleRecipeFavorite(id, isFavorite);
      setRecipes(recipes.map(recipe => 
        recipe.id === id ? { ...recipe, isFavorite } : recipe
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-zinc-900">Recipes</h1>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={onRecipeSelect}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => console.log('Open recipe creation modal')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
}; 