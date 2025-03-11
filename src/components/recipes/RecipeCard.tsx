import { RecipePreview } from '../../types/recipe';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';

interface RecipeCardProps {
  recipe: RecipePreview;
  onFavoriteToggle: (id: string, isFavorite: boolean) => Promise<void>;
  onClick: (id: string) => void;
  view: 'grid' | 'compact';
}

export const RecipeCard = ({ recipe, onFavoriteToggle, onClick, view }: RecipeCardProps) => {
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onFavoriteToggle(recipe.id, !recipe.isFavorite);
  };

  if (view === 'compact') {
    return (
      <div
        onClick={() => onClick(recipe.id)}
        className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative w-16 h-16 flex-shrink-0 bg-zinc-100 rounded-md overflow-hidden">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-zinc-900 text-sm line-clamp-1">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center text-xs text-zinc-600">
              <ClockIcon className="w-3 h-3 mr-1" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex gap-1">
              {recipe.mealTypes.slice(0, 1).map((type) => (
                <span
                  key={type}
                  className="px-1.5 py-0.5 text-xs rounded-full bg-violet-50 text-violet-700"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="flex-shrink-0 p-2 rounded-full hover:bg-zinc-50 transition-colors duration-200"
        >
          {recipe.isFavorite ? (
            <HeartSolid className="w-5 h-5 text-violet-600" />
          ) : (
            <HeartOutline className="w-5 h-5 text-zinc-400" />
          )}
        </button>
      </div>
    );
  }

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