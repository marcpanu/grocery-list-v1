import { RecipePreview } from '../../types/recipe';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';

interface RecipeCardProps {
  recipe: RecipePreview;
  onFavoriteToggle: (id: string, isFavorite: boolean) => Promise<void>;
  onClick: (id: string) => void;
}

export const RecipeCard = ({ recipe, onFavoriteToggle, onClick }: RecipeCardProps) => {
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onFavoriteToggle(recipe.id, !recipe.isFavorite);
  };

  return (
    <div
      onClick={() => onClick(recipe.id)}
      className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-zinc-100">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            No Image
          </div>
        )}
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
        >
          {recipe.isFavorite ? (
            <HeartSolid className="w-5 h-5 text-violet-600" />
          ) : (
            <HeartOutline className="w-5 h-5 text-zinc-600" />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-medium text-zinc-900 mb-2 line-clamp-1">
          {recipe.name}
        </h3>
        
        <div className="flex items-center justify-between">
          {/* Prep Time */}
          <div className="flex items-center text-sm text-zinc-600">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>{recipe.prepTime}</span>
          </div>
          
          {/* Meal Types */}
          <div className="flex gap-1">
            {recipe.mealTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 text-xs rounded-full bg-violet-50 text-violet-700"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 