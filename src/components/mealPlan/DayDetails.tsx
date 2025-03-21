import React from 'react';
import { Meal, MealPlanMealType } from '../../types/mealPlan';
import { MealCard } from './MealCard';

interface DayDetailsProps {
  selectedDay: string;
  meals: Meal[];
  onEditMeal?: (meal: Meal) => void;
  onDeleteMeal?: (mealId: string) => void;
  onUpdateMeal?: (mealId: string, updates: Partial<Meal>) => void; 
  onViewRecipe?: (recipeId: string) => void;
}

const mealTypeOrder: MealPlanMealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

const groupMealsByType = (meals: Meal[]): Record<MealPlanMealType, Meal[]> => {
  return {
    breakfast: meals.filter(meal => meal.mealPlanMeal === 'breakfast'),
    lunch: meals.filter(meal => meal.mealPlanMeal === 'lunch'),
    dinner: meals.filter(meal => meal.mealPlanMeal === 'dinner'),
    snack: meals.filter(meal => meal.mealPlanMeal === 'snack'),
    dessert: meals.filter(meal => meal.mealPlanMeal === 'dessert'),
  };
};

// Map abbreviated day names to full day names
const fullDayNames: Record<string, string> = {
  'Sun': 'Sunday',
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday'
};

export const DayDetails: React.FC<DayDetailsProps> = ({
  selectedDay,
  meals,
  onEditMeal,
  onDeleteMeal,
  onUpdateMeal,
  onViewRecipe,
}) => {
  const mealsByType = groupMealsByType(meals);

  // Handle meal click by passing to parent component
  const handleMealClick = (meal: Meal) => {
    if (onEditMeal) {
      onEditMeal(meal);
    }
  };
  
  // Handle view recipe
  const handleViewRecipe = (recipeId: string) => {
    if (onViewRecipe && recipeId) {
      onViewRecipe(recipeId);
    }
  };

  // Get the full day name, or fall back to the abbreviated name if not found
  const fullDayName = fullDayNames[selectedDay] || selectedDay;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{fullDayName}'s Meals</h2>
        <span className="text-sm text-gray-500">
          {meals.length} meal{meals.length !== 1 ? 's' : ''} planned
        </span>
      </div>

      {mealTypeOrder.map(type => {
        const typeMeals = mealsByType[type];
        if (typeMeals.length === 0) return null;

        return (
          <div key={type} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 capitalize">
              {type}
            </h3>
            <div className="grid gap-3">
              {typeMeals.map(meal => (
                <MealCard
                  key={meal.id}
                  name={meal.name}
                  description={meal.description}
                  mealPlanMeal={meal.mealPlanMeal}
                  servings={meal.servings}
                  recipeId={meal.recipeId}
                  onEdit={() => handleMealClick(meal)}
                  onDelete={onDeleteMeal ? () => onDeleteMeal(meal.id) : undefined}
                  onViewRecipe={meal.recipeId ? () => handleViewRecipe(meal.recipeId!) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}

      {meals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No meals planned for {fullDayName}</p>
          <p className="text-sm mt-1">Click "Add from Recipes" or "Quick Add" to plan a meal</p>
        </div>
      )}
    </div>
  );
}; 