import React from 'react';
import { MealPlanMealType } from '../../types/mealPlan';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MealCardProps {
  name: string;
  description?: string;
  mealPlanMeal: MealPlanMealType;
  servings: number;
  recipeId?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  onViewRecipe?: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  name,
  description: _description,
  mealPlanMeal: _mealPlanMeal,
  servings,
  recipeId,
  onEdit,
  onDelete,
  onViewRecipe,
}) => {
  const hasRecipe = !!recipeId;
  
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow ${hasRecipe ? 'cursor-pointer' : ''}`}
      onClick={(e) => {
        // Only trigger onClick if the user didn't click on one of the action buttons
        // AND the meal has a recipe
        if (e.target instanceof HTMLElement && 
            !e.target.closest('button') && 
            hasRecipe &&
            onViewRecipe) {
          onViewRecipe();
        }
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            {name}
          </h4>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            {servings} {servings === 1 ? 'serving' : 'servings'}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 text-gray-500 hover:text-violet-600"
              title="Edit meal"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-gray-500 hover:text-red-600"
              title="Delete meal"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 