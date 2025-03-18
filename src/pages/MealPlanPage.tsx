import React, { useState, useEffect } from 'react';
import { BookOpenIcon, PencilSquareIcon, DocumentTextIcon, PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
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
import { WeeklyCalendarView } from '../components/mealPlan/WeeklyCalendarView';
import { DayDetails } from '../components/mealPlan/DayDetails';
import { PageHeader } from '../components/PageHeader';

const DEFAULT_USER_ID = 'default';

const MealPlanPage: React.FC = () => {
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Sun');
  const [showActionModal, setShowActionModal] = useState(false);

  // Use the recipe import hook
  const {
    showImportModal,
    setShowImportModal,
    showUrlImportModal,
    handleImportOptionSelect,
    handleUrlImport,
    closeUrlImport
  } = useRecipeImport((recipe) => {
    if (recipe) {
      handleRecipeSelect(recipe);
    } else {
      setShowAddMealModal(true);
    }
  });

  useEffect(() => {
    const loadMealPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const plans = await getUserMealPlans(DEFAULT_USER_ID);
        setMealPlans(plans);
      } catch (error) {
        console.error('Failed to load meal plans:', error);
        setError('Failed to load meal plans. Please try again.');
      } finally {
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
      await addMealPlan(DEFAULT_USER_ID, mealPlanData);
      
      // Add a small delay to ensure Firestore has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh meal plans
      const plans = await getUserMealPlans(DEFAULT_USER_ID);
      setMealPlans(plans);
      setSuccess('Meal added successfully!');
      
      // Reset states on success
      setSelectedRecipe(undefined);
      setShowAddMealModal(false);
      setShowQuickAddModal(false);
    } catch (error) {
      console.error('Failed to add meal:', error);
      setError('Failed to add meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMeal = (meal: Meal) => {
    // TODO: Implement meal editing
    console.log('Edit meal:', meal);
  };

  const handleDeleteMeal = (mealId: string) => {
    // TODO: Implement meal deletion
    console.log('Delete meal:', mealId);
  };

  // Get meals for selected day
  const selectedDayMeals = mealPlans
    .flatMap(plan => plan.meals)
    .filter(meal => meal.days.includes(selectedDay));

  return (
    <div className="min-h-full bg-zinc-50">
      <PageHeader title="Meal Planning" />

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
        
        {/* Weekly Calendar */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6">Weekly Overview</h2>
          <WeeklyCalendarView
            mealPlans={mealPlans}
            isLoading={isLoading}
            selectedDate={selectedDay}
            onDateSelect={setSelectedDay}
          />
        </div>

        {/* Day Details */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <DayDetails
            selectedDay={selectedDay}
            meals={selectedDayMeals}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
          />
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowActionModal(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center"
        >
          <PlusIcon className="h-6 w-6" />
        </button>

        {/* Action Modal */}
        <Dialog open={showActionModal} onClose={() => setShowActionModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-white p-6">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-lg font-medium text-gray-900">Add Meal</Dialog.Title>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowRecipeSearch(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <BookOpenIcon className="h-5 w-5 text-violet-600" />
                  <span>Add from Recipes</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowImportModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <PencilSquareIcon className="h-5 w-5 text-violet-600" />
                  <span>Add New Recipe</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowQuickAddModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <DocumentTextIcon className="h-5 w-5 text-violet-600" />
                  <span>Quick Add</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <DocumentDuplicateIcon className="h-5 w-5 text-violet-600" />
                  <span>Create from Template</span>
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Existing Modals */}
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
          isLoading={isLoading}
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
            <Dialog.Panel className="mx-auto max-w-2xl w-full rounded bg-white p-6">
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
                    <div className="grid grid-cols-4 gap-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <label key={day} className="flex items-center space-x-3">
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
    </div>
  );
};

export default MealPlanPage;