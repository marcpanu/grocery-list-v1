import React, { useState, useEffect } from 'react';
import { BookOpenIcon, PencilSquareIcon, DocumentTextIcon, PlusIcon, DocumentDuplicateIcon, ShoppingCartIcon, ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Recipe } from '../types/recipe';
import { MealPlan, Meal, MealPlanMealType, Week } from '../types/mealPlan';
import RecipeSearchModal from '../components/mealPlan/RecipeSearchModal';
import { AddMealModal } from '../components/mealPlan/AddMealModal';
import { AddMealData } from '../types/mealPlan';
import { RecipeImportModal } from '../components/recipes/RecipeImportModal';
import { RecipeUrlImport } from '../components/recipes/RecipeUrlImport';
import { ScheduleMealModal, ScheduleMealData } from '../components/mealPlan/ScheduleMealModal';
import { 
  addMealPlan, 
  getUserMealPlans, 
  deleteMealById, 
  getRecipe, 
  getUserShoppingLists, 
  updateShoppingList, 
  addRecipeIngredientsToGroceryList,
  updateMealDetails, 
  getCurrentWeek, 
  getMealsByWeek, 
  getMealsByCurrentWeek,
  setCurrentWeek as updateCurrentWeekDb // Rename to avoid conflict
} from '../firebase/firestore';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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
  const [showScheduleMealModal, setShowScheduleMealModal] = useState(false);
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
  const [currentWeekLabel, setCurrentWeekLabel] = useState('');
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);

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
      // Open the schedule meal modal with the imported recipe
      setSelectedRecipe(recipe);
      setShowScheduleMealModal(true);
    } else {
      // For manual recipe creation (no recipe yet), open the AddMealModal
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
        
        // Get the current week from the meal plan
        if (plans.length > 0) {
          const activePlan = plans[0];
          setWeeks(activePlan.weeks || []);
          
          // Find the current week
          const currentWeekId = activePlan.currentWeekId;
          const activeWeek = activePlan.weeks.find(week => week.id === currentWeekId) || null;
          setCurrentWeek(activeWeek);
          
          if (activeWeek) {
            // Format the week label: "Month Day-Day, Year"
            const startDate = new Date(activeWeek.startDate);
            const endDate = new Date(activeWeek.endDate);
            const month = startDate.toLocaleString('default', { month: 'long' });
            const startDay = startDate.getDate();
            const endDay = endDate.getDate();
            const year = startDate.getFullYear();
            setCurrentWeekLabel(`${month} ${startDay}-${endDay}, ${year}`);
            
            // Load meals for the current week
            const weekMeals = await getMealsByWeek(DEFAULT_USER_ID, currentWeekId);
            setMeals(weekMeals);
          }
        }
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
    setShowScheduleMealModal(true);
  };

  const handleScheduleMeal = async (data: ScheduleMealData) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      const now = Timestamp.now();

      // Create the meal plan entry with ScheduleMealData
      const mealPlanData = {
        userId: DEFAULT_USER_ID,
        meals: [{
          id: crypto.randomUUID(),
          name: data.name,
          description: null,
          mealPlanMeal: data.mealPlanMeal,
          days: data.days,
          servings: data.servings,
          recipeId: data.recipeId,
          createdAt: now
        }],
        createdAt: now,
        updatedAt: now,
        weekId: data.weekId,
      };

      await addMealPlan(DEFAULT_USER_ID, mealPlanData);
      
      // Add a small delay to ensure Firestore has processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh meal plans and meals
      const plans = await getUserMealPlans(DEFAULT_USER_ID);
      setMealPlans(plans);
      
      // Refresh meals for the current week
      if (currentWeek) {
        const weekMeals = await getMealsByWeek(DEFAULT_USER_ID, data.weekId);
        setMeals(weekMeals);
      }
      
      setSuccess('Meal scheduled successfully!');
      
      // Reset states on success
      setSelectedRecipe(undefined);
      setShowScheduleMealModal(false);
    } catch (error) {
      console.error('Failed to schedule meal:', error);
      setError('Failed to schedule meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = async (data: Recipe | AddMealData) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);
      const now = Timestamp.now();

      // If we don't have a selectedRecipe and data is AddMealData with ingredients, create a recipe
      let recipeId = selectedRecipe?.id;
      let createdRecipe: Recipe | null = null;
      
      if (!selectedRecipe && 'ingredients' in data && data.ingredients && data.ingredients.length > 0) {
        // Creating a new recipe from the meal plan data
        const newRecipe = await addRecipe({
          name: data.name,
          description: data.description ?? null,
          prepTime: typeof data.prepTime === 'string' ? parseInt(data.prepTime) || null : null,
          cookTime: typeof data.cookTime === 'string' ? parseInt(data.cookTime) || null : null,
          totalTime: null,
          displayTotalTime: "unknown", // This will be calculated properly when saved
          servings: data.servings,
          ingredients: data.ingredients.map((ing: any) => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit ?? null,
            notes: ing.notes ?? null
          })),
          instructions: data.instructions?.map((instruction: any) => ({
            order: 1,
            instruction: typeof instruction === 'string' ? instruction : instruction.instruction
          })) || [],
          imageUrl: null,
          notes: null,
          mealTypes: data.mealTypes || [], // Ensure it's not undefined
          cuisine: data.cuisine ?? null,
          rating: data.rating ?? null,
          dateAdded: now.toDate(),
          isFavorite: false,
          source: null
        });
        
        recipeId = newRecipe.id;
        createdRecipe = newRecipe;
        
        // After creating the recipe, show the schedule meal modal
        if (createdRecipe) {
          setSelectedRecipe(createdRecipe);
          setShowAddMealModal(false);
          setShowScheduleMealModal(true);
          setIsLoading(false);
          return;
        }
      }

      // For the existing "Quick Add" flow, continue as before
      if ('mealPlanMeal' in data && !createdRecipe) {
        // Create the meal plan entry
        const mealPlanData = {
          userId: DEFAULT_USER_ID,
          meals: [{
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description ?? null,
            mealPlanMeal: data.mealPlanMeal,
            days: data.days,
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
      }
    } catch (error) {
      console.error('Failed to add meal:', error);
      setError('Failed to add meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMeal = (meal: Meal) => {
    // Open the ScheduleMealModal to replace with a different recipe
    if (meal.recipeId) {
      getRecipe(meal.recipeId).then(recipe => {
        if (recipe) {
          setSelectedRecipe(recipe);
          setShowScheduleMealModal(true);
        }
      });
    } else {
      // For quick add meals, open the quick add modal
      setShowQuickAddModal(true);
    }
  };

  const handleDeleteMeal = (mealId: string) => {
    setMealToDelete(mealId);
  };

  const confirmDelete = async () => {
    if (!mealToDelete) return;
    
    try {
      setIsLoading(true);
      await deleteMealById(mealToDelete);
      
      // Update meals state directly
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealToDelete));
      
      setSuccess('Meal deleted successfully');
      setMealToDelete(null);
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal');
    } finally {
      setIsLoading(false);
    }
  };

  // Get meals for selected day
  const selectedDayMeals = meals.filter(meal => meal.days.includes(selectedDay));

  const handleQuickAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (formData.get('name') === '') {
      setError('Meal name is required');
      return;
    }
    
    const selectedDays = Object.entries(Object.fromEntries(formData.entries()))
      .filter(([key, value]) => key.startsWith('day-') && value === 'on')
      .map(([key]) => key.replace('day-', ''));

    if (selectedDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    const weekId = formData.get('weekId') as string;
    if (!weekId) {
      setError('Please select a week');
      return;
    }
    
    const mealPlanMeal = formData.get('mealPlanMeal') as MealPlanMealType;
    const name = formData.get('name') as string;
    const servings = Number(formData.get('servings'));
    
    // Create a meal with default empty arrays for optional fields
    const newMeal: AddMealData = {
      name,
      mealPlanMeal,
      days: selectedDays,
      servings: isNaN(servings) ? 1 : servings,
      weekId, // Add the weekId
      mealTypes: [] // Add an empty array for mealTypes
    };
    
    handleAddMeal(newMeal);
    setShowQuickAddModal(false);
  };

  // Function to handle adding all meal plan ingredients to grocery list
  const handleAddAllToGroceryList = async () => {
    try {
      // Get all meals with recipe IDs
      const mealsWithRecipeIds = meals.filter(meal => meal.recipeId);
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
        const mealsWithRecipeIds = meals.filter(meal => meal.recipeId);
        
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
      const mealsWithRecipeIds = meals.filter(meal => meal.recipeId);
      
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

  // New function to update a meal in Firestore
  const handleUpdateMeal = async (mealId: string, mealData: Partial<Meal>) => {
    try {
      setIsLoading(true);
      await updateMealDetails(mealId, mealData);
      
      // Update meals state directly
      setMeals(prevMeals => 
        prevMeals.map(meal => 
          meal.id === mealId ? { ...meal, ...mealData } : meal
        )
      );
      
      setSuccess('Meal updated successfully');
    } catch (error) {
      console.error('Error updating meal:', error);
      setError('Failed to update meal');
    } finally {
      setIsLoading(false);
    }
  };

  // Simplify the update flow
  // 1. Define a loadWeekData function just to load data for a week
  const loadWeekData = async (weekId: string) => {
    try {
      const newCurrentWeek = weeks.find(week => week.id === weekId) || null;
      setCurrentWeek(newCurrentWeek);
      
      if (newCurrentWeek) {
        // Format the week label
        const startDate = new Date(newCurrentWeek.startDate);
        const endDate = new Date(newCurrentWeek.endDate);
        const month = startDate.toLocaleString('default', { month: 'long' });
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const year = startDate.getFullYear();
        setCurrentWeekLabel(`${month} ${startDay}-${endDay}, ${year}`);
        
        // Load meals for the selected week
        const weekMeals = await getMealsByWeek(DEFAULT_USER_ID, weekId);
        setMeals(weekMeals);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load week data:', error);
      setError('Failed to load week data. Please try again.');
      return false;
    }
  };

  // 2. Define a week change handler for UI
  const handleWeekClick = async (weekId: string) => {
    setIsLoading(true);
    try {
      // First update in Firestore
      await updateCurrentWeekDb(DEFAULT_USER_ID, weekId); 
      
      // Then load the data
      await loadWeekData(weekId);
      
      // Refresh meal plans to get updated data
      const plans = await getUserMealPlans(DEFAULT_USER_ID);
      setMealPlans(plans);
    } catch (error) {
      console.error('Failed to change week:', error);
      setError('Failed to change week. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Today button handler
  const handleTodayButtonClick = async () => {
    setIsLoading(true);
    try {
      const todayWeek = await getCurrentWeek(DEFAULT_USER_ID);
      await handleWeekClick(todayWeek.id);
    } catch (error) {
      console.error('Failed to set current week:', error);
      setError('Failed to set current week. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-zinc-50">
      <PageHeader 
        title="Meal Planning"
        actions={null}
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
        
        {/* Week Timeline with Today button */}
        <div className="bg-white rounded-lg shadow p-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-medium text-zinc-700">Timeline</h3>
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-violet-600" />
                <span className="font-medium text-sm">{currentWeekLabel}</span>
              </div>
            </div>
            <button 
              onClick={handleTodayButtonClick}
              className="px-2 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 rounded-md font-medium text-zinc-700"
            >
              Today
            </button>
          </div>
          <div className="flex items-center space-x-1.5 py-1 overflow-x-auto scrollbar-hide">
            {weeks.map((week) => {
              const isCurrentWeek = currentWeek?.id === week.id;
              const weekStart = new Date(week.startDate);
              const weekEnd = new Date(week.endDate);
              
              // Format the dates for display
              const formatDate = (date: Date) => {
                return `${date.getMonth() + 1}/${date.getDate()}`;
              };
              
              const weekLabel = `${formatDate(weekStart)}-${formatDate(weekEnd)}`;
              
              // Determine if week is in past, present, or future
              const now = new Date();
              const isPast = weekEnd < now;
              const isFuture = weekStart > now;
              
              return (
                <div 
                  key={week.id}
                  onClick={() => handleWeekClick(week.id)}
                  className={`flex-shrink-0 p-1.5 rounded-md border cursor-pointer ${
                    isCurrentWeek
                      ? 'border-violet-600 bg-violet-50' 
                      : isPast
                        ? 'border-zinc-200 bg-zinc-50' 
                        : 'border-zinc-200'
                  }`}
                >
                  <div className="text-xs font-medium">{weekLabel}</div>
                  <div className="mt-0.5 flex items-center">
                    <div 
                      className={`h-1 w-full rounded-full ${
                        isCurrentWeek
                          ? 'bg-violet-600' 
                          : isPast
                            ? 'bg-zinc-400' 
                            : 'bg-zinc-200'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Weekly Calendar */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Weekly Overview</h2>
            {/* Current week indicator - now shows the actual current week */}
            <span className="text-xs text-zinc-500">
              Week of {new Date(currentWeek?.startDate || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          <WeeklyCalendarView
            mealPlans={mealPlans}
            isLoading={isLoading}
            selectedDate={selectedDay}
            onDateSelect={setSelectedDay}
            meals={meals} // Pass the meals directly to the component
          />
          
          {/* Add All to Grocery List button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleAddAllToGroceryList}
              disabled={addingToGroceryList}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md text-white w-full justify-center ${
                addingToGroceryList 
                ? 'bg-violet-400 cursor-not-allowed' 
                : 'bg-violet-600 hover:bg-violet-700'
              } transition-colors duration-200`}
            >
              {addingToGroceryList ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="h-4 w-4" />
                  Add All to Grocery List
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Day Details */}
        <div className="bg-white rounded-lg shadow p-3 md:p-4">
          <DayDetails
            selectedDay={selectedDay}
            meals={selectedDayMeals}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
            onUpdateMeal={handleUpdateMeal}
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
                  <span>Schedule from Saved Recipes</span>
                </button>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowImportModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <PencilSquareIcon className="h-5 w-5 text-violet-600" />
                  <span>Create New Recipe</span>
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

        {/* ScheduleMealModal - only render when selectedRecipe exists */}
        {selectedRecipe && (
          <ScheduleMealModal
            isOpen={showScheduleMealModal}
            onClose={() => {
              setShowScheduleMealModal(false);
              // Clear the selected recipe when the modal is closed to prevent stale references
              setSelectedRecipe(undefined);
            }}
            onSchedule={handleScheduleMeal}
            recipe={selectedRecipe}
            isLoading={isLoading}
            weeks={weeks}
            currentWeekId={currentWeek?.id || ''}
          />
        )}

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
              <form onSubmit={handleQuickAdd} className="space-y-4">
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

                  {/* Recipe Classification (meal types) */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Recipe Types (select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map((type) => (
                        <label key={type} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name="mealTypes"
                            value={type}
                            className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-zinc-700 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Meal Planning (mealPlanMeal) */}
                    <div>
                      <label htmlFor="mealPlanMeal" className="block text-sm font-medium text-zinc-700">
                        Meal of the Day
                      </label>
                      <select
                        name="mealPlanMeal"
                        id="mealPlanMeal"
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

                {/* Add Week Selection */}
                <div>
                  <label htmlFor="weekId" className="block text-sm font-medium text-zinc-700">
                    Week <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="weekId"
                    id="weekId"
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                    defaultValue={currentWeek?.id || ''}
                    required
                  >
                    {weeks.map(week => {
                      const startDate = new Date(week.startDate);
                      const endDate = new Date(week.endDate);
                      const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
                      const label = `${formatDate(startDate)}-${formatDate(endDate)}`;
                      
                      return (
                        <option key={week.id} value={week.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
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
          onConfirm={confirmDelete}
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