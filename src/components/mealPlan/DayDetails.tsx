import React from 'react';
import { Meal } from '../../types/mealPlan';
import { MealType } from '../../types/recipe';
import { MealCard } from './MealCard';

interface DayDetailsProps {
  selectedDay: string;
  meals: Meal[];
  onEditMeal?: (meal: Meal) => void;
  onDeleteMeal?: (mealId: string) => void;
}

const mealTypeOrder: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

const groupMealsByType = (meals: Meal[]): Record<MealType, Meal[]> => {
  return {
    breakfast: meals.filter(meal => meal.type === 'breakfast'),
    lunch: meals.filter(meal => meal.type === 'lunch'),
    dinner: meals.filter(meal => meal.type === 'dinner'),
    snack: meals.filter(meal => meal.type === 'snack'),
    dessert: meals.filter(meal => meal.type === 'dessert'),
  };
};

export const DayDetails: React.FC<DayDetailsProps> = ({
  selectedDay,
  meals,
  onEditMeal,
  onDeleteMeal,
}) => {
  const mealsByType = groupMealsByType(meals);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{selectedDay}'s Meals</h2>
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
                  type={meal.type}
                  servings={meal.servings}
                  onEdit={onEditMeal ? () => onEditMeal(meal) : undefined}
                  onDelete={onDeleteMeal ? () => onDeleteMeal(meal.id) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}

      {meals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No meals planned for {selectedDay}</p>
          <p className="text-sm mt-1">Click "Add from Recipes" or "Quick Add" to plan a meal</p>
        </div>
      )}
    </div>
  );
}; 