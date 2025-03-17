import React, { useState, useEffect } from 'react';
import { BookOpenIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Recipe } from '../types/recipe';
import { MealPlan, Meal } from '../types/mealPlan';
import RecipeSearchModal from '../components/mealPlan/RecipeSearchModal';
import { AddMealModal } from '../components/mealPlan/AddMealModal';
import { RecipeImportModal } from '../components/recipes/RecipeImportModal';
import { RecipeUrlImport } from '../components/recipes/RecipeUrlImport';
import { addMealPlan, getUserMealPlans } from '../firebase/firestore';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MealType } from '../types/recipe';
import { Timestamp } from 'firebase/firestore';
import { useRecipeImport } from '../hooks/useRecipeImport';

const DEFAULT_USER_ID = 'default';

export const MealPlanPage: React.FC = () => {
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Use the recipe import hook
  const {
    showImportModal,
    setShowImportModal,
    showUrlImportModal,
    handleImportOptionSelect,
    handleUrlImport,
    closeUrlImport
  } = useRecipeImport((recipe) => {
    // This callback will be called after a recipe is imported
    if (recipe) {
      handleRecipeSelect(recipe);
    } else {
      // This is the manual creation case
      setShowAddMealModal(true);
    }
  });

  useEffect(() => {
    const loadMealPlans = async () => {
      try {
        console.log('Starting to load meal plans for user:', DEFAULT_USER_ID);
        setIsLoading(true);
        setError(null);
        const plans = await getUserMealPlans(DEFAULT_USER_ID);
        console.log('Retrieved meal plans:', plans);
        setMealPlans(plans);
      } catch (error) {
        console.error('Failed to load meal plans:', error);
        setError('Failed to load meal plans. Please try again.');
      } finally {
        console.log('Finished loading meal plans, setting isLoading to false');
        setIsLoading(false);
      }
    };
    loadMealPlans();
  }, []);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeSearch(false);
    setShowAddMealModal(true);
  };

  const handleAddMeal = async (meal: Omit<Meal, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      console.log('Adding meal:', meal);
      const now = Timestamp.now();
      const mealPlanData = {
        userId: DEFAULT_USER_ID,
        meals: [{
          ...meal,
          id: crypto.randomUUID(),
          createdAt: now,
          recipeId: selectedRecipe?.id,
        }],
        createdAt: now,
        updatedAt: now,
      };
      console.log('Meal plan data:', mealPlanData);
      await addMealPlan(DEFAULT_USER_ID, mealPlanData);
      
      // Add a small delay to ensure Firestore has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh meal plans
      const plans = await getUserMealPlans(DEFAULT_USER_ID);
      console.log('Retrieved meal plans:', plans);
      setMealPlans(plans);
      setSuccess('Meal added successfully!');
      
      // Reset states on success
      setSelectedRecipe(undefined);
      setShowAddMealModal(false);
      setShowQuickAddModal(false);
    } catch (error) {
      console.error('Failed to add meal:', error);
      setError('Failed to add meal. Please try again.');
      // Don't close modals on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meal Planning</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowRecipeSearch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            <BookOpenIcon className="w-5 h-5" />
            Add from Recipes
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <PencilSquareIcon className="w-5 h-5" />
            Add New Recipe
          </button>
          <button
            onClick={() => setShowQuickAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
        <div className="grid grid-cols-7 gap-4">
          {isLoading ? (
            <div className="col-span-7 flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          ) : (
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{day}</h3>
                <div className="space-y-2">
                  {mealPlans
                    .flatMap(plan => plan.meals)
                    .filter(meal => meal.days.includes(day))
                    .map((meal) => (
                      <div key={meal.id} className="text-sm p-2 bg-gray-50 rounded">
                        {meal.name}
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Day Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Day Details</h2>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          ) : mealPlans.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No meals planned yet.</p>
          ) : (
            mealPlans
              .flatMap(plan => plan.meals)
              .map((meal) => (
                <div key={meal.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{meal.name}</h3>
                  {meal.description && (
                    <p className="text-sm text-gray-500 mt-1">{meal.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{meal.type}</span>
                    <span>•</span>
                    <span>{meal.servings} servings</span>
                    <span>•</span>
                    <span>{meal.days.join(', ')}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Modals */}
      <RecipeSearchModal
        isOpen={showRecipeSearch}
        onClose={() => setShowRecipeSearch(false)}
        onSelect={handleRecipeSelect}
      />

      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => {
          setShowAddMealModal(false);
          setSelectedRecipe(undefined);
        }}
        onAdd={handleAddMeal}
        selectedRecipe={selectedRecipe}
      />

      <RecipeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSelectOption={handleImportOptionSelect}
      />

      <RecipeUrlImport
        isOpen={showUrlImportModal}
        onClose={closeUrlImport}
        onImport={handleUrlImport}
      />

      {/* Quick Add Modal */}
      <Dialog open={showQuickAddModal} onClose={() => setShowQuickAddModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium">Quick Add Meal</Dialog.Title>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const meal = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as MealType,
                servings: parseInt(formData.get('servings') as string),
                days: Array.from(formData.getAll('days')).map(value => value.toString()),
              };
              handleAddMeal(meal);
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="type"
                    id="type"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
                    Servings
                  </label>
                  <input
                    type="number"
                    name="servings"
                    id="servings"
                    required
                    min="1"
                    defaultValue="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="days"
                          value={day}
                          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  Add Meal
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MealPlanPage; 