import React, { useState, useEffect } from 'react';
import { BookOpenIcon, PencilSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Recipe } from '../types/recipe';
import { MealPlan, Meal } from '../types/mealPlan';
import RecipeSearchModal from '../components/mealPlan/RecipeSearchModal';
import { AddMealModal } from '../components/mealPlan/AddMealModal';
import { RecipeImportModal } from '../components/recipes/RecipeImportModal';
import { addMealPlan, getUserMealPlans } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MealType } from '../types/recipe';
import { Timestamp } from 'firebase/firestore';

export const MealPlanPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadMealPlans = async () => {
      if (!user) {
        console.log('No user found, skipping meal plan load');
        return;
      }
      try {
        console.log('Starting to load meal plans for user:', user.uid);
        setIsLoading(true);
        setError(null);
        const plans = await getUserMealPlans(user.uid);
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
  }, [user]);

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeSearch(false);
    setShowAddMealModal(true);
  };

  const handleImportOptionSelect = (optionId: string) => {
    setShowImportModal(false);
    if (optionId === 'manual') {
      setShowAddMealModal(true);
    }
  };

  const handleAddMeal = async (meal: Omit<Meal, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      console.log('Adding meal:', meal);
      const now = Timestamp.now();
      const mealPlanData = {
        userId: user.uid,
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
      await addMealPlan(user.uid, mealPlanData);
      
      // Add a small delay to ensure Firestore has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh meal plans
      const plans = await getUserMealPlans(user.uid);
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

  if (authLoading) {
    console.log('Auth is still loading');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!user) {
    console.log('No authenticated user found');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Please sign in to view your meal plans.</p>
      </div>
    );
  }

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

      {/* Quick Add Modal */}
      <Dialog open={showQuickAddModal} onClose={() => setShowQuickAddModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold">Quick Add Meal</Dialog.Title>
              <button onClick={() => setShowQuickAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const selectedDays = Array.from(formData.getAll('days')).map(value => value.toString());
              
              if (selectedDays.length === 0) {
                setError('Please select at least one day for the meal.');
                return;
              }

              const name = formData.get('name') as string;
              if (!name.trim()) {
                setError('Please enter a meal name.');
                return;
              }

              const type = formData.get('type') as MealType;
              if (!type) {
                setError('Please select a meal type.');
                return;
              }

              const servings = parseInt(formData.get('servings') as string) || 0;
              if (servings < 1) {
                setError('Please enter a valid number of servings.');
                return;
              }

              handleAddMeal({
                name: name.trim(),
                description: (formData.get('description') as string)?.trim() || '',
                type,
                days: selectedDays,
                servings,
              });
              setShowQuickAddModal(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                  >
                    {['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <label key={day} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name="days"
                          value={day}
                          className="rounded text-violet-600"
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
                    name="servings"
                    min="1"
                    defaultValue="2"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    Add Meal
                  </button>
                </div>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default MealPlanPage; 