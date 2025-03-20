import React from 'react';
import { MealPlan, Meal, MealPlanMealType } from '../../types/mealPlan';

interface WeeklyCalendarViewProps {
  mealPlans: MealPlan[];
  isLoading: boolean;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

interface DayMeals {
  [key: string]: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snack: Meal[];
    dessert: Meal[];
  };
}

const groupMealsByType = (meals: Meal[]): Record<MealPlanMealType, Meal[]> => {
  return {
    breakfast: meals.filter(meal => meal.mealPlanMeal === 'breakfast'),
    lunch: meals.filter(meal => meal.mealPlanMeal === 'lunch'),
    dinner: meals.filter(meal => meal.mealPlanMeal === 'dinner'),
    snack: meals.filter(meal => meal.mealPlanMeal === 'snack'),
    dessert: meals.filter(meal => meal.mealPlanMeal === 'dessert'),
  };
};

export const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  mealPlans,
  isLoading,
  selectedDate,
  onDateSelect,
}) => {
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const fullDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group meals by day and type
  const mealsByDay = fullDays.reduce<DayMeals>((acc, day) => {
    const dayMeals = mealPlans
      .flatMap(plan => plan.meals)
      .filter(meal => meal.days.includes(day));
    
    acc[day] = groupMealsByType(dayMeals);
    return acc;
  }, {} as DayMeals);

  const getMealTypeIndicator = (type: MealPlanMealType, count: number) => {
    if (count === 0) return null;
    
    const colors = {
      breakfast: 'bg-yellow-400',
      lunch: 'bg-green-400',
      dinner: 'bg-violet-400',
      snack: 'bg-blue-400',
      dessert: 'bg-pink-400',
    };

    return (
      <div 
        className={`h-1.5 w-1.5 rounded-full ${colors[type]}`}
        title={`${count} ${type} meal${count > 1 ? 's' : ''}`}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="col-span-7 flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-2 md:gap-4">
      {fullDays.map((day, index) => {
        const isSelected = day === selectedDate;
        const dayMeals = mealsByDay[day];
        const totalMeals = Object.values(dayMeals).flat().length;

        return (
          <button
            key={day}
            onClick={() => onDateSelect(day)}
            className={`
              relative flex flex-col items-center p-2 md:p-4 rounded-lg border
              transition-all duration-200 min-h-[80px] md:min-h-[120px]
              ${isSelected 
                ? 'border-violet-600 bg-violet-50 shadow-sm' 
                : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
              }
            `}
          >
            {/* Day header */}
            <div className="w-full flex justify-between items-center mb-2">
              <span className="md:hidden font-medium">{daysOfWeek[index]}</span>
              <span className="hidden md:block font-medium">{day}</span>
              {totalMeals > 0 && (
                <span className="text-xs text-violet-600 font-medium">
                  {totalMeals}
                </span>
              )}
            </div>

            {/* Meal type indicators */}
            <div className="flex flex-col gap-1 items-center mt-auto">
              {Object.entries(dayMeals).map(([type, meals]) => 
                getMealTypeIndicator(type as MealPlanMealType, meals.length) && (
                  <div key={type}>
                    {getMealTypeIndicator(type as MealPlanMealType, meals.length)}
                  </div>
                )
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}; 