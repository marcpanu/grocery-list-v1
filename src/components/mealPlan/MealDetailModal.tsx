import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Meal, MealPlanMealType } from '../../types/mealPlan';
import RecipeSearchModal from './RecipeSearchModal';
import { Recipe } from '../../types/recipe';

interface MealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
  onEdit: (mealId: string, updates: Partial<Meal>) => void;
  onReplaceMeal: (meal: Meal) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  isOpen,
  onClose,
  meal,
  onEdit,
  onReplaceMeal
}) => {
  const [servings, setServings] = useState<number>(meal?.servings || 1);
  const [mealType, setMealType] = useState<MealPlanMealType>(meal?.mealPlanMeal || 'breakfast');
  const [selectedDays, setSelectedDays] = useState<string[]>(meal?.days || []);
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Recipe | null>(null);
  
  // Reset state when meal changes
  useEffect(() => {
    if (meal) {
      setServings(meal.servings);
      setMealType(meal.mealPlanMeal);
      setSelectedDays(meal.days);
      setNewRecipe(null);
    }
  }, [meal]);

  if (!meal) return null;

  const handleSave = () => {
    // If we have a new recipe, create an updated meal and use onReplaceMeal
    if (newRecipe) {
      const updatedMeal: Meal = {
        ...meal,
        name: newRecipe.name,
        description: newRecipe.description || undefined,
        recipeId: newRecipe.id,
        servings: servings,
        mealPlanMeal: mealType,
        days: selectedDays
      };
      
      onReplaceMeal(updatedMeal);
    } else {
      // Otherwise just update the meal details
      onEdit(meal.id, {
        servings,
        mealPlanMeal: mealType,
        days: selectedDays
      });
    }
    
    onClose();
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    // Store the selected recipe locally instead of updating immediately
    setNewRecipe(recipe);
    
    // Close the recipe search modal
    setShowRecipeSearch(false);
  };

  // Handle opening the recipe search modal
  const openRecipeSearch = () => {
    setShowRecipeSearch(true);
  };

  // Determine the meal name to display (use new recipe name if selected)
  const displayName = newRecipe ? newRecipe.name : meal.name;
  const displayDescription = newRecipe ? newRecipe.description : meal.description;

  // Show RecipeSearchModal only if showRecipeSearch is true, otherwise show the MealDetailModal
  return (
    <>
      {/* MealDetailModal - only show when recipe search is not active */}
      {!showRecipeSearch && (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
                    {displayName}
                    <button
                      onClick={openRecipeSearch}
                      className="ml-2 p-1 text-gray-500 hover:text-violet-600"
                      title="Change recipe"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </Dialog.Title>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {displayDescription && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                    <p className="text-sm text-gray-600">{displayDescription}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Meal Type</h3>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealPlanMealType)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-sm"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Servings</h3>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-sm"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Days</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`p-2 text-xs font-medium rounded ${
                          selectedDays.includes(day)
                            ? 'bg-violet-100 text-violet-800 border border-violet-300'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700"
                >
                  Save Changes
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Recipe Search Modal */}
      <RecipeSearchModal
        isOpen={showRecipeSearch && isOpen}
        onClose={() => setShowRecipeSearch(false)}
        onSelect={handleRecipeSelect}
      />
    </>
  );
}; 