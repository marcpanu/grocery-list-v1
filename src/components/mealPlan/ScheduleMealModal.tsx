import React, { useState} from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Recipe } from '../../types/recipe';
import { MealPlanMealType, Week } from '../../types/mealPlan';
import { DaySelector } from './DaySelector';

interface ScheduleMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: ScheduleMealData) => void;
  recipe: Recipe;
  isLoading?: boolean;
  weeks: Week[];
  currentWeekId: string;
}

export interface ScheduleMealData {
  recipeId: string;
  name: string;
  mealPlanMeal: MealPlanMealType;
  days: string[];
  servings: number;
  weekId: string;
}

export const ScheduleMealModal: React.FC<ScheduleMealModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  recipe,
  isLoading = false,
  weeks,
  currentWeekId,
}) => {
  const [formData, setFormData] = useState<ScheduleMealData>({
    recipeId: recipe?.id || '',
    name: recipe?.name || '',
    mealPlanMeal: 'dinner',
    days: [],
    servings: recipe?.servings || 2,
    weekId: currentWeekId,
  });
  
  const [errors, setErrors] = useState<{
    mealPlanMeal?: string;
    days?: string;
    weekId?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user inputs values
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDaysChange = (newDays: string[]) => {
    setFormData(prev => ({
      ...prev,
      days: newDays
    }));
    
    // Clear the days error if days are selected
    if (newDays.length > 0 && errors.days) {
      setErrors(prev => ({ ...prev, days: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {
      mealPlanMeal?: string;
      days?: string;
      weekId?: string;
    } = {};
    
    if (!formData.mealPlanMeal) {
      newErrors.mealPlanMeal = 'Please select a meal type';
    }
    
    if (formData.days.length === 0) {
      newErrors.days = 'Please select at least one day';
    }
    
    if (!formData.weekId) {
      newErrors.weekId = 'Please select a week';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSchedule(formData);
  };

  // Helper to format week label for display
  const formatWeekLabel = (week: Week) => {
    const startDate = new Date(week.startDate);
    const endDate = new Date(week.endDate);
    const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
    return `${formatDate(startDate)}-${formatDate(endDate)}`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Schedule Meal</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipe
              </label>
              <div className="px-4 py-2 border bg-gray-50 border-gray-300 rounded-lg">
                {recipe.name}
              </div>
            </div>

            <div>
              <label htmlFor="weekId" className="block text-sm font-medium text-gray-700 mb-1">
                Week <span className="text-red-500">*</span>
              </label>
              <select
                id="weekId"
                name="weekId"
                value={formData.weekId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${
                  errors.weekId ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600`}
              >
                {weeks.map(week => (
                  <option key={week.id} value={week.id}>
                    {formatWeekLabel(week)}
                  </option>
                ))}
              </select>
              {errors.weekId && (
                <p className="mt-1 text-sm text-red-500">{errors.weekId}</p>
              )}
            </div>

            <div>
              <label htmlFor="mealPlanMeal" className="block text-sm font-medium text-gray-700 mb-1">
                Meal of the Day <span className="text-red-500">*</span>
              </label>
              <select
                id="mealPlanMeal"
                name="mealPlanMeal"
                value={formData.mealPlanMeal}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${
                  errors.mealPlanMeal ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600`}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert</option>
              </select>
              {errors.mealPlanMeal && (
                <p className="mt-1 text-sm text-red-500">{errors.mealPlanMeal}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                Servings <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="servings"
                name="servings"
                min="1"
                value={formData.servings}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days <span className="text-red-500">*</span>
              </label>
              <DaySelector 
                selectedDays={formData.days}
                onChange={handleDaysChange}
                disabled={isLoading}
              />
              {errors.days && (
                <p className="mt-1 text-sm text-red-500">{errors.days}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-violet-400"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add to Meal Plan'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 