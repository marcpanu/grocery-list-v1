import React, { useState } from 'react';
import { MealPlan, Meal, MealPlanMealType } from '../../types/mealPlan';
import { SaveAsTemplateModal } from './SaveAsTemplateModal';
import { saveWeekAsTemplate } from '../../firebase/firestore';
import { toast } from 'react-hot-toast';

interface WeeklyCalendarViewProps {
  mealPlans: MealPlan[];
  isLoading: boolean;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  meals: Meal[];
  weekId: string;
  userId: string;
  onTemplateCreated: () => Promise<void>;
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
  mealPlans: _mealPlans,
  isLoading,
  selectedDate,
  onDateSelect,
  meals,
  weekId,
  userId,
  onTemplateCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleSaveTemplate = async (name: string, description?: string) => {
    try {
      setLoading(true);
      await saveWeekAsTemplate(userId, weekId, name, description);
      setShowTemplateModal(false);
      await onTemplateCreated();
    } catch (err) {
      console.error('Failed to save template:', err);
      toast.error('Failed to save template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const fullDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group meals by day and type
  const mealsByDay = fullDays.reduce<DayMeals>((acc, day) => {
    const dayMeals = meals.filter(meal => meal.days.includes(day));
    
    acc[day] = groupMealsByType(dayMeals);
    return acc;
  }, {} as DayMeals);

  const getMealTypeIndicator = (type: MealPlanMealType, count: number) => {
    if (count === 0) return null;
    
    const colors = {
      breakfast: 'bg-amber-400',
      lunch: 'bg-emerald-400',
      dinner: 'bg-violet-400',
      snack: 'bg-blue-400',
      dessert: 'bg-pink-400'
    };

    return (
      <div className={`w-2 h-2 rounded-full ${colors[type]}`} />
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
    <>
      <div className="space-y-4">
        {/* Week Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Week Overview</h2>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-3 py-1.5 text-sm font-medium rounded-md text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors"
            disabled={isLoading || meals.length === 0}
          >
            Save as Template
          </button>
        </div>

        {/* Calendar Grid */}
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
                  relative flex flex-col items-center p-1.5 md:p-3 rounded-lg border
                  transition-all duration-200 min-h-[60px] md:min-h-[90px]
                  ${isSelected 
                    ? 'border-violet-600 bg-violet-50 shadow-sm' 
                    : 'border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50'
                  }
                `}
              >
                {/* Day header */}
                <div className="w-full flex justify-between items-center mb-1">
                  <span className="md:hidden font-medium">{daysOfWeek[index]}</span>
                  <span className="hidden md:block font-medium">{day}</span>
                  {totalMeals > 0 && (
                    <span className="text-xs text-violet-600 font-medium">
                      {totalMeals}
                    </span>
                  )}
                </div>

                {/* Meal type indicators */}
                <div className="flex flex-col gap-0.5 items-center mt-auto">
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
      </div>

      <SaveAsTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSave={handleSaveTemplate}
        isLoading={loading}
      />
    </>
  );
}; 