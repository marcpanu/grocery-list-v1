import { useState } from 'react';
import { Recipe, Ingredient, getDisplayTotalTime } from '../../types/recipe';
import { updateRecipe } from '../../firebase/firestore';
import { CUISINES } from '../../types/recipe';

interface RecipeEditFormProps {
  recipe: Recipe;
  onSave: () => void;
  onCancel: () => void;
}

export const RecipeEditForm = ({ recipe, onSave, onCancel }: RecipeEditFormProps) => {
  const [formData, setFormData] = useState<Omit<Recipe, 'id' | 'dateAdded' | 'totalTime' | 'displayTotalTime'>>({
    name: recipe.name,
    description: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    ingredients: [...recipe.ingredients],
    instructions: [...recipe.instructions],
    imageUrl: recipe.imageUrl,
    notes: recipe.notes,
    mealTypes: recipe.mealTypes ?? [],
    cuisine: recipe.cuisine || [],
    rating: recipe.rating,
    isFavorite: recipe.isFavorite,
    isScalable: recipe.isScalable || false,
    source: recipe.source
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Strip "Other:" prefix from cuisine values before saving
      const cleanedFormData = {
        ...formData,
        // Explicitly convert all optional fields from undefined to null for Firestore
        description: formData.description ?? null,
        prepTime: formData.prepTime ?? null,
        cookTime: formData.cookTime ?? null,
        imageUrl: formData.imageUrl ?? null,
        notes: formData.notes ?? null,
        mealTypes: formData.mealTypes ?? [],
        cuisine: (formData.cuisine || []).map(c => c.startsWith('Other:') ? c.replace('Other:', '') : c),
        rating: formData.rating ?? null
      };
      
      // Calculate totalTime
      const prepTime = cleanedFormData.prepTime || 0;
      const cookTime = cleanedFormData.cookTime || 0;
      const totalTime = prepTime + cookTime;
      
      // Set displayTotalTime based on totalTime
      const displayTotalTime = getDisplayTotalTime(totalTime);
      
      await updateRecipe(recipe.id, {
        ...cleanedFormData,
        totalTime,
        displayTotalTime
      });
      
      onSave();
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number | null) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = {
      ...newInstructions[index],
      instruction: value
    };
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: null, notes: null }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
            Recipe Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value || null }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="prepTime" className="block text-sm font-medium text-zinc-700">
              Prep Time (min)
            </label>
            <input
              type="number"
              id="prepTime"
              value={formData.prepTime || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value ? parseInt(e.target.value) : null }))}
              min="0"
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="cookTime" className="block text-sm font-medium text-zinc-700">
              Cook Time (min)
            </label>
            <input
              type="number"
              id="cookTime"
              value={formData.cookTime || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value ? parseInt(e.target.value) : null }))}
              min="0"
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="servings" className="block text-sm font-medium text-zinc-700">
              Servings
            </label>
            <input
              type="number"
              id="servings"
              value={formData.servings}
              onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
              min="1"
              className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isScalable"
            checked={formData.isScalable}
            onChange={(e) => setFormData(prev => ({ ...prev, isScalable: e.target.checked }))}
            className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
          />
          <label htmlFor="isScalable" className="text-sm font-medium text-zinc-700">
            Recipe is easily scalable
          </label>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-zinc-900">Ingredients</h3>
          <button
            type="button"
            onClick={addIngredient}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-violet-700 bg-violet-50 hover:bg-violet-100"
          >
            + Add
          </button>
        </div>
        <div className="space-y-4">
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="Ingredient name"
                  className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-24">
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    placeholder="Amount"
                    className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                </div>
                <div className="flex-1 sm:w-24">
                  <input
                    type="text"
                    value={ingredient.unit || ''}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value || null)}
                    placeholder="Unit"
                    className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="inline-flex items-center p-1.5 text-zinc-500 hover:text-zinc-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-violet-700 bg-violet-50 hover:bg-violet-100"
          >
            + Add
          </button>
        </div>
        <div className="space-y-4">
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-none pt-2 text-sm font-medium text-zinc-700">
                {index + 1}.
              </div>
              <div className="flex-1">
                <textarea
                  value={instruction.instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                  placeholder={`Step ${index + 1}`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="flex-none inline-flex items-center p-1.5 text-zinc-500 hover:text-zinc-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-zinc-700">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={formData.imageUrl || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value || null }))}
            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-zinc-700">
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value || null }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Meal Types
          </label>
          <div className="flex flex-wrap gap-2">
            {['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map((type) => (
              <label key={type} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.mealTypes?.includes(type) || false}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...(formData.mealTypes || []), type]
                      : (formData.mealTypes || []).filter(t => t !== type);
                    setFormData(prev => ({ ...prev, mealTypes: newTypes }));
                  }}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="ml-2 text-sm text-zinc-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Cuisine
          </label>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((cuisine) => (
                <label key={cuisine} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={(formData.cuisine || []).includes(cuisine)}
                    onChange={(e) => {
                      const newCuisines = e.target.checked
                        ? [...(formData.cuisine || []), cuisine]
                        : (formData.cuisine || []).filter(c => c !== cuisine);
                      setFormData(prev => ({ ...prev, cuisine: newCuisines }));
                    }}
                    className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="ml-2 text-sm text-zinc-700">{cuisine}</span>
                </label>
              ))}
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.cuisine || []).includes('Caribbean')}
                  onChange={(e) => {
                    const newCuisines = e.target.checked
                      ? [...(formData.cuisine || []), 'Caribbean']
                      : (formData.cuisine || []).filter(c => c !== 'Caribbean');
                    setFormData(prev => ({ ...prev, cuisine: newCuisines }));
                  }}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="ml-2 text-sm text-zinc-700">Caribbean</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.cuisine || []).includes('African')}
                  onChange={(e) => {
                    const newCuisines = e.target.checked
                      ? [...(formData.cuisine || []), 'African']
                      : (formData.cuisine || []).filter(c => c !== 'African');
                    setFormData(prev => ({ ...prev, cuisine: newCuisines }));
                  }}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="ml-2 text-sm text-zinc-700">African</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={(formData.cuisine || []).some(c => c.startsWith('Other:'))}
                  onChange={(e) => {
                    const newCuisines = e.target.checked
                      ? [...(formData.cuisine || []).filter(c => !c.startsWith('Other:')), 'Other:']
                      : (formData.cuisine || []).filter(c => !c.startsWith('Other:'));
                    setFormData(prev => ({ ...prev, cuisine: newCuisines }));
                  }}
                  className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="ml-2 text-sm text-zinc-700">Other</span>
              </label>
            </div>
            {(formData.cuisine || []).some(c => c.startsWith('Other:')) && (
              <div className="mt-2">
                <input
                  type="text"
                  value={(formData.cuisine || []).find(c => c.startsWith('Other:'))?.replace('Other:', '') || ''}
                  onChange={(e) => {
                    const otherCuisine = e.target.value;
                    const newCuisines = [
                      ...(formData.cuisine || []).filter(c => !c.startsWith('Other:')),
                      otherCuisine ? `Other:${otherCuisine}` : 'Other:'
                    ];
                    setFormData(prev => ({ ...prev, cuisine: newCuisines }));
                  }}
                  placeholder="Enter cuisine type"
                  className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-zinc-700">
            Rating (1-5)
          </label>
          <input
            type="number"
            id="rating"
            value={formData.rating ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value ? parseInt(e.target.value) : null }))}
            min="1"
            max="5"
            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          {isSaving ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </form>
  );
}; 