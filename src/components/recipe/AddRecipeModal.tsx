import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
  const [cookTime, setCookTime] = useState<number | null>(null);
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: '', unit: null, notes: null }]);
  const [instructions, setInstructions] = useState<Instruction[]>([{ order: 1, instruction: '' }]);
  const [mealTypes, setMealTypes] = useState<string[]>(['dinner']);
  const [cuisine, setCuisine] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate totalTime and displayTotalTime
    const totalTime = (prepTime || 0) + (cookTime || 0);
    const displayTotalTime = getDisplayTotalTime(totalTime);
    
    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      name,
      description: description || null,
      prepTime,
      cookTime,
      totalTime,
      displayTotalTime,
      servings,
      ingredients: ingredients.filter(ing => ing.name.trim() !== ''),
      instructions: instructions.filter(inst => inst.instruction.trim() !== ''),
      mealTypes,
      cuisine: cuisine.filter(c => c.trim() !== ''),
      dateAdded: new Date(),
      isFavorite: false,
      imageUrl: null,
      notes: null,
      rating: null,
      source: null
    };

    onAdd(newRecipe);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: null, notes: null }]);
  };

  const addInstruction = () => {
    setInstructions([...instructions, { order: instructions.length + 1, instruction: '' }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = { ...newInstructions[index], instruction: value };
    setInstructions(newInstructions);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Create New Recipe</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prep Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={prepTime === null ? '' : prepTime}
                  onChange={(e) => setPrepTime(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                  placeholder="e.g. 15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cook Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cookTime === null ? '' : cookTime}
                  onChange={(e) => setCookTime(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                  placeholder="e.g. 30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servings
              </label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients
              </label>
              <div className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                      placeholder="Amount"
                    />
                    <input
                      type="text"
                      value={ingredient.unit || ''}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                      placeholder="Unit"
                    />
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                      placeholder="Ingredient name"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  + Add Ingredient
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <div className="space-y-2">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex items-center text-sm text-gray-500 w-8">
                      {index + 1}.
                    </span>
                    <textarea
                      value={instruction.instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                      rows={2}
                      placeholder={`Step ${index + 1}...`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInstruction}
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  + Add Step
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Types
              </label>
              <div className="flex flex-wrap gap-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <label key={type} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={mealTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMealTypes([...mealTypes, type]);
                        } else {
                          setMealTypes(mealTypes.filter(t => t !== type));
                        }
                      }}
                      className="rounded text-violet-600"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine
              </label>
              <input
                type="text"
                value={cuisine[0]}
                onChange={(e) => setCuisine([e.target.value])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="e.g. Italian, Mexican, Chinese"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Create Recipe
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 