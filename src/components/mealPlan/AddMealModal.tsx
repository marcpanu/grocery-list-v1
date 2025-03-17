import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MealType } from '../../types/recipe';
import { Recipe } from '../../types/recipe';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (meal: {
    name: string;
    description?: string;
    type: MealType;
    days: string[];
    servings: number;
    recipeId?: string;
  }) => void;
  selectedRecipe?: Recipe;
  isLoading?: boolean;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  selectedRecipe,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MealType>('dinner');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [servings, setServings] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  // Reset form when modal opens/closes or selectedRecipe changes
  useEffect(() => {
    if (isOpen && selectedRecipe) {
      setName(selectedRecipe.name);
      setDescription(selectedRecipe.description || '');
      // Ensure we get a valid meal type from the recipe
      const recipeMealType = selectedRecipe.mealTypes[0];
      if (recipeMealType && mealTypes.includes(recipeMealType as MealType)) {
        setType(recipeMealType as MealType);
      } else {
        setType('dinner'); // Default to dinner if no valid meal type
      }
      setServings(selectedRecipe.servings);
    } else if (!isOpen) {
      // Only reset when modal closes
      setName('');
      setDescription('');
      setType('dinner');
      setServings(2);
      setSelectedDays([]);
      setError(null);
    }
  }, [isOpen, selectedRecipe]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate days selection
    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    // Validate servings
    if (servings < 1) {
      setError('Servings must be at least 1');
      return;
    }

    setError(null);
    onAdd({
      name,
      description,
      type,
      days: selectedDays,
      servings,
      recipeId: selectedRecipe?.id,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {selectedRecipe ? 'Add Recipe to Meal Plan' : 'Add New Meal'}
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRecipe && (
              <div className="bg-violet-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-violet-900">Selected Recipe</h3>
                <p className="text-violet-800">{selectedRecipe.name}</p>
                {selectedRecipe.description && (
                  <p className="text-sm text-violet-700 mt-1">{selectedRecipe.description}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                required
                disabled={!!selectedRecipe || isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                rows={3}
                disabled={!!selectedRecipe || isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MealType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                disabled={isLoading}
              >
                {mealTypes.map((mealType) => (
                  <option key={mealType} value={mealType}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <label 
                    key={day} 
                    className={`flex items-center gap-1 p-2 rounded ${
                      selectedDays.includes(day) 
                        ? 'bg-violet-100 text-violet-900' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDays([...selectedDays, day]);
                        } else {
                          setSelectedDays(selectedDays.filter((d) => d !== day));
                        }
                      }}
                      className="rounded text-violet-600"
                      disabled={isLoading}
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
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
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Meal'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 