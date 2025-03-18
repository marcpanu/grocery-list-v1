import React, { useState, useEffect } from 'react';
import { BookOpenIcon, PencilSquareIcon, DocumentTextIcon, PlusIcon, DocumentDuplicateIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Recipe } from '../types/recipe';
import { MealPlan, Meal } from '../types/mealPlan';
import RecipeSearchModal from '../components/mealPlan/RecipeSearchModal';
import { AddMealModal, AddMealData } from '../components/mealPlan/AddMealModal';
import { RecipeImportModal } from '../components/recipes/RecipeImportModal';
import { RecipeUrlImport } from '../components/recipes/RecipeUrlImport';
import { addMealPlan, getUserMealPlans, deleteMeal, getRecipe, getUserShoppingLists, updateShoppingList, addRecipeIngredientsToGroceryList } from '../firebase/firestore';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MealType } from '../types/recipe';
import { Timestamp } from 'firebase/firestore';
import { useRecipeImport } from '../hooks/useRecipeImport';
import { WeeklyCalendarView } from '../components/mealPlan/WeeklyCalendarView';
import { DayDetails } from '../components/mealPlan/DayDetails';
import { PageHeader } from '../components/PageHeader';
import { addRecipe } from '../firebase/firestore';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ConfirmGroceryListDialog } from '../components/common/ConfirmGroceryListDialog';
import { toast, Toaster } from 'react-hot-toast';

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
  const [selectedDay, setSelectedDay] = useState<string>('Sun');
  const [showActionModal, setShowActionModal] = useState(false);
  const [ingredientCount, setIngredientCount] = useState(1);
  const [instructionCount, setInstructionCount] = useState(1);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [showGroceryListConfirm, setShowGroceryListConfirm] = useState(false);
  const [addingToGroceryList, setAddingToGroceryList] = useState(false);

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

  const handleAddMeal = async (data: Recipe | AddMealData) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      const now = Timestamp.now();

      // If we don't have a selectedRecipe and data is AddMealData with ingredients, create a recipe
      let recipeId = selectedRecipe?.id;
      if (!selectedRecipe && 'type' in data && 'ingredients' in data && data.ingredients && data.ingredients.length > 0) {
        const newRecipe = await addRecipe({
          name: data.name,
          description: data.description ?? null,
          prepTime: data.prepTime ?? '<30',
          cookTime: data.cookTime ?? null,
          totalTime: data.totalTime ?? null,
          servings: data.servings,
          ingredients: data.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit ?? null,
            notes: ing.notes ?? null
          })),
          instructions: data.instructions?.map(instruction => ({
            order: 1,
            instruction: instruction ?? ''
          })) || [],
          imageUrl: null,
          notes: null,
          mealTypes: [data.type],
          cuisine: data.cuisine ?? null,
          rating: data.rating ?? null,
          dateAdded: now.toDate(),
          isFavorite: false,
          source: null
        });
        recipeId = newRecipe.id;
      }

      // Create the meal plan entry
      const mealPlanData = {
        userId: DEFAULT_USER_ID,
        meals: [{
          id: crypto.randomUUID(),
          name: data.name,
          description: data.description ?? null,
          type: 'type' in data ? data.type : data.mealTypes[0],
          days: 'days' in data ? data.days : [],
          servings: data.servings,
          recipeId: recipeId ?? null,
          createdAt: now
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
    setMealToDelete(mealId);
  };

  const confirmDeleteMeal = async () => {
    if (!mealToDelete) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteMeal(DEFAULT_USER_ID, mealToDelete);
      
      // Update local state
      setMealPlans(prevPlans => 
        prevPlans.map(plan => ({
          ...plan,
          meals: plan.meals.filter(meal => meal.id !== mealToDelete)
        }))
      );
      
      setSuccess('Meal deleted successfully!');
    } catch (error) {
      console.error('Failed to delete meal:', error);
      setError('Failed to delete meal. Please try again.');
    } finally {
      setMealToDelete(null);
      setIsLoading(false);
    }
  };

  // Get meals for selected day
  const selectedDayMeals = mealPlans
    .flatMap(plan => plan.meals)
    .filter(meal => meal.days.includes(selectedDay));

  const handleQuickAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const meal: AddMealData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as MealType,
      servings: parseInt(formData.get('servings') as string),
      prepTime: formData.get('prepTime') as string,
      ingredients: Array.from({ length: ingredientCount }, (_, i) => ({
        name: formData.get(`ingredient-${i}-name`) as string,
        quantity: formData.get(`ingredient-${i}-quantity`) as string,
        unit: formData.get(`ingredient-${i}-unit`) as string,
        notes: ''
      })).filter(ing => ing.name.trim() !== ''),
      instructions: Array.from({ length: instructionCount }, (_, i) => 
        formData.get(`instruction-${i}`) as string
      ).filter(inst => inst.trim() !== ''),
      days: Array.from(formData.getAll('days')).map(value => value.toString())
    };
    handleAddMeal(meal);
  };

  // Function to handle adding all meal plan ingredients to grocery list
  const handleAddAllToGroceryList = async () => {
    try {
      // Get all meals with recipe IDs
      const mealsWithRecipeIds = mealPlans.flatMap(plan => 
        plan.meals.filter(meal => meal.recipeId)
      );
      if (mealsWithRecipeIds.length === 0) {
        toast.error('No recipes found in meal plan');
        return;
      }

      // Track recipe serving multipliers based on number of days
      const recipeServingMultipliers = new Map<string, number>();

      // Count recipe occurrences and track serving adjustments
      for (const meal of mealsWithRecipeIds) {
        if (!meal.recipeId) continue;
        
        // Count the number of days this meal appears on
        const dayCount = meal.days.length;
        
        // For each recipe, we need to track:
        // 1. How many times it appears (days)
        // 2. The servings adjustment from the recipe's original servings
        if (recipeServingMultipliers.has(meal.recipeId)) {
          // Add to the existing multiplier
          const currentMultiplier = recipeServingMultipliers.get(meal.recipeId) || 0;
          recipeServingMultipliers.set(meal.recipeId, currentMultiplier + dayCount);
        } else {
          // Initialize with the day count
          recipeServingMultipliers.set(meal.recipeId, dayCount);
        }
      }

      // Check if user already has items in the grocery list
      const userLists = await getUserShoppingLists('default');
      if (userLists.length > 0 && userLists[0].items.length > 0) {
        // Show confirmation dialog
        setShowGroceryListConfirm(true);
      } else {
        // No items in list, just add ingredients
        await addAllIngredientsToGroceryList(recipeServingMultipliers);
        toast.success('Recipe ingredients added to your grocery list!');
      }
    } catch (error) {
      console.error('Failed to add ingredients to grocery list:', error);
      toast.error('Failed to add ingredients to grocery list');
    }
  };

  const addAllIngredientsToGroceryList = async (recipeServingMultipliers: Map<string, number>) => {
    try {
      // Get all unique recipes
      const recipes = await Promise.all(
        Array.from(recipeServingMultipliers.keys()).map(id => getRecipe(id))
      );

      // Add ingredients from each recipe with its multiplier
      for (const recipe of recipes) {
        if (!recipe) continue;
        const multiplier = recipeServingMultipliers.get(recipe.id) || 1;
        await addRecipeIngredientsToGroceryList(recipe, multiplier);
      }
    } catch (error) {
      console.error('Error adding ingredients:', error);
      throw error;
    }
  };

  // Function to clear grocery list and add all ingredients
  const handleClearAndAddToGroceryList = async () => {
    try {
      // Close the dialog but keep the loading state
      setShowGroceryListConfirm(false);
      
      // Show loading toast
      const loadingToast = toast.loading('Clearing grocery list and adding ingredients...');
      
      // Clear the existing list and add the new ingredients
      const userLists = await getUserShoppingLists('default');
      if (userLists.length > 0) {
        const list = userLists[0];
        
        // Clear all items
        await updateShoppingList(list.id, { items: [] });
        
        // Get all meals with recipe IDs and calculate multipliers
        const mealsWithRecipeIds = mealPlans.flatMap(plan => 
          plan.meals.filter(meal => meal.recipeId)
        );
        
        // Track recipe serving multipliers based on number of days
        const recipeServingMultipliers = new Map<string, number>();
        
        // Count recipe occurrences and track serving adjustments
        for (const meal of mealsWithRecipeIds) {
          if (!meal.recipeId) continue;
          const dayCount = meal.days.length;
          if (recipeServingMultipliers.has(meal.recipeId)) {
            const currentMultiplier = recipeServingMultipliers.get(meal.recipeId) || 0;
            recipeServingMultipliers.set(meal.recipeId, currentMultiplier + dayCount);
          } else {
            recipeServingMultipliers.set(meal.recipeId, dayCount);
          }
        }
        
        // Add all ingredients with correct multipliers
        await addAllIngredientsToGroceryList(recipeServingMultipliers);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Grocery list cleared and new ingredients added!');
      }
    } catch (error) {
      console.error('Failed to clear and add ingredients:', error);
      toast.error('Failed to update grocery list');
    } finally {
      // Reset all states
      setAddingToGroceryList(false);
    }
  };

  // Function to add to existing grocery list
  const handleAddToExistingGroceryList = async () => {
    try {
      // Close the dialog but keep the loading state
      setShowGroceryListConfirm(false);
      
      // Show loading toast
      const loadingToast = toast.loading('Adding ingredients to grocery list...');
      
      // Get all meals with recipe IDs and calculate multipliers
      const mealsWithRecipeIds = mealPlans.flatMap(plan => 
        plan.meals.filter(meal => meal.recipeId)
      );
      
      // Track recipe serving multipliers based on number of days
      const recipeServingMultipliers = new Map<string, number>();
      
      // Count recipe occurrences and track serving adjustments
      for (const meal of mealsWithRecipeIds) {
        if (!meal.recipeId) continue;
        const dayCount = meal.days.length;
        if (recipeServingMultipliers.has(meal.recipeId)) {
          const currentMultiplier = recipeServingMultipliers.get(meal.recipeId) || 0;
          recipeServingMultipliers.set(meal.recipeId, currentMultiplier + dayCount);
        } else {
          recipeServingMultipliers.set(meal.recipeId, dayCount);
        }
      }
      
      // Add all ingredients with correct multipliers
      await addAllIngredientsToGroceryList(recipeServingMultipliers);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Ingredients added to your grocery list!');
    } catch (error) {
      console.error('Failed to add ingredients:', error);
      toast.error('Failed to update grocery list');
    } finally {
      // Reset all states
      setAddingToGroceryList(false);
    }
  };

  return (
    <div className="min-h-full bg-zinc-50">
      <PageHeader 
        title="Meal Planning"
        actions={
          <button
            onClick={handleAddAllToGroceryList}
            disabled={addingToGroceryList}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white ${
              addingToGroceryList 
              ? 'bg-violet-400 cursor-not-allowed' 
              : 'bg-violet-600 hover:bg-violet-700'
            } transition-colors duration-200`}
          >
            {addingToGroceryList ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <ShoppingCartIcon className="h-5 w-5" />
                Add All to Grocery List
              </>
            )}
          </button>
        }
      />

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
          isAddingToMealPlan={true}
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
              <form onSubmit={handleQuickAdd}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
                        Meal Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-zinc-700">
                          Type
                        </label>
                        <select
                          name="type"
                          id="type"
                          required
                          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                          <option value="dessert">Dessert</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="prepTime" className="block text-sm font-medium text-zinc-700">
                          Prep Time
                        </label>
                        <select
                          name="prepTime"
                          id="prepTime"
                          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        >
                          <option value="<30">Less than 30 minutes</option>
                          <option value="30-60">30-60 minutes</option>
                          <option value="60+">More than 60 minutes</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="servings" className="block text-sm font-medium text-zinc-700">
                          Servings
                        </label>
                        <input
                          type="number"
                          name="servings"
                          id="servings"
                          min="1"
                          defaultValue="1"
                          className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-zinc-900">Ingredients</h3>
                      <button
                        type="button"
                        onClick={() => setIngredientCount(prev => prev + 1)}
                        className="text-sm text-violet-600 hover:text-violet-700"
                      >
                        + Add Ingredient
                      </button>
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: ingredientCount }, (_, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="flex-1">
                            <input
                              type="text"
                              name={`ingredient-${index}-name`}
                              placeholder="Ingredient name"
                              className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                            />
                          </div>
                          <div className="w-24">
                            <input
                              type="text"
                              name={`ingredient-${index}-quantity`}
                              placeholder="Amount"
                              className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                            />
                          </div>
                          <div className="w-24">
                            <input
                              type="text"
                              name={`ingredient-${index}-unit`}
                              placeholder="Unit"
                              className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                            />
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setIngredientCount(prev => prev - 1);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-zinc-900">Instructions</h3>
                      <button
                        type="button"
                        onClick={() => setInstructionCount(prev => prev + 1)}
                        className="text-sm text-violet-600 hover:text-violet-700"
                      >
                        + Add Step
                      </button>
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: instructionCount }, (_, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <span className="flex items-center text-sm text-zinc-500 w-8">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <textarea
                              name={`instruction-${index}`}
                              rows={2}
                              placeholder={`Step ${index + 1}...`}
                              className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                            />
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setInstructionCount(prev => prev - 1);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Days Selection */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Days
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <label key={day} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="days"
                            value={day}
                            className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-zinc-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={!!mealToDelete}
          onClose={() => setMealToDelete(null)}
          onConfirm={confirmDeleteMeal}
          title="Delete Meal"
          message="Are you sure you want to delete this meal? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Add the ConfirmGroceryListDialog */}
        <ConfirmGroceryListDialog
          isOpen={showGroceryListConfirm}
          onClose={() => {
            if (!addingToGroceryList) {
              setShowGroceryListConfirm(false);
            }
          }}
          onConfirmClear={handleClearAndAddToGroceryList}
          onConfirmAdd={handleAddToExistingGroceryList}
          isLoading={addingToGroceryList}
        />

        {/* Add the Toaster for notifications */}
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 5000,
            loading: {
              duration: Infinity
            },
            success: {
              duration: 3000,
            },
            error: {
              duration: 4000,
            },
            style: {
              maxWidth: '500px',
            },
          }}
        />
      </div>
    </div>
  );
};

export default MealPlanPage;