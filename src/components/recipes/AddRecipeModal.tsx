import React, { useState } from 'react';
import { Recipe, Ingredient, Instruction, getDisplayTotalTime } from '../../types/recipe';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (recipe: Recipe) => void;
}

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState<number | null>(null);
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: '', unit: null, notes: null }]);
  const [instructions, setInstructions] = useState<Instruction[]>([{ order: 1, instruction: '' }]);
  const [mealTypes, setMealTypes] = useState<string[]>(['dinner']);
  const [cuisine, setCuisine] = useState<string[]>(['']);
  const [isScalable, setIsScalable] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      name,
      description: description || null,
      prepTime,
      servings,
      ingredients: ingredients.filter(ing => ing.name.trim() !== ''),
      instructions: instructions.filter(inst => inst.instruction.trim() !== ''),
      mealTypes: mealTypes.filter(type => type.trim() !== '') || null,
      cuisine: cuisine.filter(c => c.trim() !== '') || null,
      dateAdded: new Date(),
      isFavorite: false,
      isScalable: isScalable,
      cookTime: null,
      totalTime: null,
      displayTotalTime: getDisplayTotalTime(null),
      imageUrl: null,
      notes: null,
      rating: null,
      source: null
    };

    onAdd(newRecipe);
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
    </div>
  );
};

export default AddRecipeModal; 