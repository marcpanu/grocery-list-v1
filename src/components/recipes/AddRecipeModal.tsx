import React, { useState } from 'react';
import { Recipe } from '../../types/recipe';

interface AddRecipeModalProps {
  onSubmit: (recipe: Recipe) => void;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  onSubmit
}) => {
  const [isScalable, setIsScalable] = useState(false);

  const handleSubmit = () => {
    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      name: '',
      description: null,
      prepTime: null,
      cookTime: null,
      totalTime: null,
      displayTotalTime: '',
      servings: 4,
      ingredients: [],
      instructions: [],
      imageUrl: null,
      notes: null,
      mealTypes: [],
      cuisine: null,
      rating: null,
      dateAdded: new Date(),
      isFavorite: false,
      source: null,
      isScalable
    };
    onSubmit(newRecipe);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <input
        type="checkbox"
        checked={isScalable}
        onChange={(e) => setIsScalable(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
      />
      <label className="text-sm font-medium text-gray-700">
        This recipe works well for easily making smaller or larger portions (e.g., cut in half)
      </label>
      <button onClick={handleSubmit} className="ml-4 px-4 py-2 bg-violet-600 text-white rounded-md">
        Add Recipe
      </button>
    </div>
  );
};

export default AddRecipeModal; 