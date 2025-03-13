import React, { useState } from 'react';
import { MealType, Meal } from '../types/mealPlan';
import { PageHeader } from '../components/PageHeader';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { AddMealModal } from '../components/mealPlan/AddMealModal';
import { NewPlanModal } from '../components/mealPlan/NewPlanModal';
import { MealCard } from '../components/mealPlan/MealCard';

const MealPlanPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'other'];

  const handleAddMeal = (mealData: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMeal: Meal = {
      ...mealData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMeals([...meals, newMeal]);
  };

  const handleDeleteMeal = (mealId: string) => {
    setMeals(meals.filter(meal => meal.id !== mealId));
  };

  const handleEditMeal = (mealId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit meal:', mealId);
  };

  const handleCreateBlankPlan = () => {
    setMeals([]);
  };

  const getMealsForDay = (day: string) => {
    return meals.filter(meal => meal.days.includes(day));
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Meal Plan" />
      
      {/* Section 1: Add Meal Section (Sticky Header) */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Add Meal</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter meal name or search recipes..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
            <button 
              onClick={() => setShowAddMealModal(true)}
              className="p-2 text-gray-600 hover:text-violet-600"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-600 hover:text-violet-600">
              <PencilIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Days of week checkboxes */}
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center gap-1">
                <input type="checkbox" className="rounded text-violet-600" />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>

          {/* Meal type selector */}
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600">
            {mealTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section 2: Weekly Overview */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex overflow-x-auto gap-2 pb-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${
                selectedDay === day ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-medium">{day}</span>
              <div className="w-2 h-2 rounded-full bg-violet-600 mt-1"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Day Details */}
      <div className="flex-1 p-4">
        <h3 className="text-lg font-semibold mb-4">
          {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <div className="space-y-4">
          {getMealsForDay(selectedDay).length > 0 ? (
            getMealsForDay(selectedDay).map((meal) => (
              <MealCard
                key={meal.id}
                name={meal.name}
                description={meal.description}
                type={meal.type}
                servings={meal.servings}
                onEdit={() => handleEditMeal(meal.id)}
                onDelete={() => handleDeleteMeal(meal.id)}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No meals planned for today
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewPlanModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-violet-700 transition-colors"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Modals */}
      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAdd={handleAddMeal}
      />

      <NewPlanModal
        isOpen={showNewPlanModal}
        onClose={() => setShowNewPlanModal(false)}
        onCreateBlank={handleCreateBlankPlan}
      />
    </div>
  );
};

export default MealPlanPage; 