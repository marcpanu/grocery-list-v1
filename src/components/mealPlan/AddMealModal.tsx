import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CUISINES, Ingredient } from '../../types/recipe';
import { Recipe } from '../../types/recipe';
import { MealPlanMealType } from '../../types/mealPlan';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Recipe | AddMealData) => void;
  selectedRecipe?: Recipe;
  isLoading?: boolean;
  isAddingToMealPlan: boolean;
}

export interface AddMealData {
  name: string;
  description?: string;
  mealTypes: string[];
  mealPlanMeal: MealPlanMealType;
  days: string[];
  servings: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients?: Ingredient[];
  instructions?: string[];
  cuisine?: string[];
  rating?: number;
  recipeId?: string;
}

interface FormData {
  name: string;
  description: string;
  mealTypes: string[];
  mealPlanMeal: string;
  days: string[];
  servings: number;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  ingredients: Ingredient[];
  instructions: { order: number; instruction: string }[];
  notes: string;
  cuisine: string[];
  rating: number | undefined;
}

export const AddMealModal = ({
  isOpen,
  onClose,
  onAdd,
  selectedRecipe,
  isLoading = false,
  isAddingToMealPlan
}: AddMealModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    mealTypes: [],
    mealPlanMeal: '',
    days: [],
    servings: 2,
    prepTime: '',
    cookTime: '',
    totalTime: '',
    ingredients: [{ name: '', quantity: '', unit: '', notes: '' }],
    instructions: [{ order: 1, instruction: '' }],
    notes: '',
    cuisine: [],
    rating: undefined
  });

  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or selectedRecipe changes
  useEffect(() => {
    if (isOpen && selectedRecipe) {
      setFormData({
        name: selectedRecipe.name,
        description: selectedRecipe.description || '',
        mealTypes: selectedRecipe.mealTypes || [],
        mealPlanMeal: '',
        days: [],
        servings: selectedRecipe.servings,
        prepTime: selectedRecipe.prepTime?.toString() || '',
        cookTime: selectedRecipe.cookTime?.toString() || '',
        totalTime: selectedRecipe.totalTime?.toString() || '',
        ingredients: [...selectedRecipe.ingredients],
        instructions: [...selectedRecipe.instructions],
        notes: selectedRecipe.notes || '',
        cuisine: selectedRecipe.cuisine || [],
        rating: selectedRecipe.rating || undefined
      });
    } else if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        mealTypes: [],
        mealPlanMeal: '',
        days: [],
        servings: 2,
        prepTime: '',
        cookTime: '',
        totalTime: '',
        ingredients: [{ name: '', quantity: '', unit: '', notes: '' }],
        instructions: [{ order: 1, instruction: '' }],
        notes: '',
        cuisine: [],
        rating: undefined
      });
      setError(null);
    }
  }, [isOpen, selectedRecipe]);

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '', notes: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { order: prev.instructions.length + 1, instruction: '' }]
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index).map((inst, i) => ({
        ...inst,
        order: i + 1
      }))
    }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = {
      ...newInstructions[index],
      instruction: value
    };
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check required fields
    if (!formData.name.trim()) {
      setError('Recipe name is required');
      return;
    }

    if (isAddingToMealPlan && !formData.mealPlanMeal) {
      setError('Please select which meal of the day this is for');
      return;
    }

    if (formData.servings <= 0) {
      setError('Servings must be greater than 0');
      return;
    }

    // Validate ingredients
    const validIngredients = formData.ingredients.filter(ing => 
      ing.name.trim() && (typeof ing.quantity === 'string' ? ing.quantity.trim() : ing.quantity)
    );
    if (validIngredients.length === 0) {
      setError('At least one ingredient with name and quantity is required');
      return;
    }

    // Validate instructions
    const validInstructions = formData.instructions.filter(inst => 
      inst.instruction.trim()
    );
    if (validInstructions.length === 0) {
      setError('At least one instruction is required');
      return;
    }

    // Validate days if adding to meal plan
    if (isAddingToMealPlan && formData.days.length === 0) {
      setError('Please select at least one day');
      return;
    }

    if (!selectedRecipe && formData.mealTypes.length === 0) {
      setError('Please select at least one meal type for the recipe');
      return;
    }

    const formDataToAdd: AddMealData = {
      name: formData.name.trim(),
      description: formData.description || undefined,
      mealTypes: formData.mealTypes,
      mealPlanMeal: formData.mealPlanMeal as MealPlanMealType,
      servings: Number(formData.servings),
      prepTime: formData.prepTime,
      cookTime: formData.cookTime || undefined,
      totalTime: formData.totalTime || undefined,
      ingredients: validIngredients,
      instructions: validInstructions.map(i => i.instruction),
      cuisine: formData.cuisine,
      rating: formData.rating,
      days: isAddingToMealPlan ? formData.days : [],
      ...(selectedRecipe && { recipeId: selectedRecipe.id })
    };

    onAdd(formDataToAdd);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {selectedRecipe ? 'Add Recipe to Meal Plan' : 'Add New Recipe'}
            </Dialog.Title>
            <button 
              onClick={onClose} 
              className="text-zinc-400 hover:text-zinc-500"
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {selectedRecipe && (
            <div className="bg-violet-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-violet-900">Selected Recipe</h3>
              <p className="text-violet-800">{selectedRecipe.name}</p>
              {selectedRecipe.description && (
                <p className="text-sm text-violet-700 mt-1">{selectedRecipe.description}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
                  Recipe Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  required
                  disabled={!!selectedRecipe || isLoading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  disabled={!!selectedRecipe || isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Recipe Type <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.mealTypes.includes(type)}
                        onChange={(e) => {
                          const newMealTypes = e.target.checked
                            ? [...formData.mealTypes, type]
                            : formData.mealTypes.filter(t => t !== type);
                          setFormData(prev => ({ ...prev, mealTypes: newMealTypes }));
                        }}
                        className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                        disabled={isLoading || !!selectedRecipe}
                      />
                      <span className="ml-2 text-sm text-zinc-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Only show meal plan specific fields when adding to meal plan */}
              {isAddingToMealPlan && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="mealPlanMeal" className="block text-sm font-medium text-zinc-700">
                      Meal of the Day <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="mealPlanMeal"
                      value={formData.mealPlanMeal}
                      onChange={(e) => setFormData(prev => ({ ...prev, mealPlanMeal: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                      required={isAddingToMealPlan}
                      disabled={isLoading}
                    >
                      <option value="">Select a meal</option>
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
                      id="prepTime"
                      value={formData.prepTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                      disabled={isLoading}
                    >
                      <option value="">Select prep time</option>
                      <option value="<30">Less than 30 minutes</option>
                      <option value="30-60">30-60 minutes</option>
                      <option value="60+">More than 60 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cookTime" className="block text-sm font-medium text-zinc-700">
                      Cook Time
                    </label>
                    <select
                      id="cookTime"
                      value={formData.cookTime || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                      disabled={isLoading}
                    >
                      <option value="">Select cook time</option>
                      <option value="<30">Less than 30 minutes</option>
                      <option value="30-60">30-60 minutes</option>
                      <option value="60+">More than 60 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="servings" className="block text-sm font-medium text-zinc-700">
                      Servings <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="servings"
                      value={formData.servings}
                      onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                      min="1"
                      className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-zinc-900">Ingredients</h3>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-violet-600 hover:text-violet-700"
                  disabled={isLoading}
                >
                  + Add Ingredient
                </button>
              </div>
              <div className="space-y-4">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        placeholder="Ingredient name"
                        className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        placeholder="Amount"
                        className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        value={ingredient.unit || ''}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        placeholder="Unit"
                        className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={ingredient.notes || ''}
                        onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                        placeholder="Notes (optional)"
                        className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      ×
                    </button>
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
                  onClick={addInstruction}
                  className="text-sm text-violet-600 hover:text-violet-700"
                  disabled={isLoading}
                >
                  + Add Step
                </button>
              </div>
              <div className="space-y-4">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-violet-100 text-violet-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={instruction.instruction}
                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                        placeholder="Step instruction"
                        rows={2}
                        className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-zinc-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Cuisine
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map((cuisine) => (
                    <label key={cuisine} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.cuisine.includes(cuisine)}
                        onChange={(e) => {
                          const newCuisines = e.target.checked
                            ? [...formData.cuisine, cuisine]
                            : formData.cuisine.filter(c => c !== cuisine);
                          setFormData(prev => ({ ...prev, cuisine: newCuisines }));
                        }}
                        className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                        disabled={isLoading}
                      />
                      <span className="ml-2 text-sm text-zinc-700">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-zinc-700">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  id="rating"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value ? parseInt(e.target.value) : undefined }))}
                  min="1"
                  max="5"
                  className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Only show days selection when adding to meal plan */}
              {isAddingToMealPlan && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Days
                  </label>
                  <div className="grid grid-cols-4 gap-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <label key={day} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.days.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked
                              ? [...formData.days, day]
                              : formData.days.filter(d => d !== day);
                            setFormData(prev => ({ ...prev, days: newDays }));
                          }}
                          className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                          disabled={isLoading}
                        />
                        <span className="ml-2 text-sm text-zinc-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  'Add Meal'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 