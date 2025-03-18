import { useState, useEffect } from 'react';
import { Recipe } from '../../types/recipe';
import { getRecipe, deleteRecipe, toggleRecipeFavorite } from '../../firebase/firestore';
import { 
  ClockIcon, 
  HeartIcon,
  ArrowLeftIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  ShareIcon,
  VideoCameraIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import ConfirmDialog from '../common/ConfirmDialog';
import { RecipeEditModal } from './RecipeEditModal';
import { ConfirmGroceryListDialog } from '../common/ConfirmGroceryListDialog';
import { toast, Toaster } from 'react-hot-toast';
import {
  addRecipeIngredientsToGroceryList,
  getUserShoppingLists,
  updateShoppingList
} from '../../firebase/firestore';

interface RecipeDetailProps {
  recipeId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export const RecipeDetail = ({ recipeId, onBack }: RecipeDetailProps) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGroceryListConfirm, setShowGroceryListConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingToGroceryList, setAddingToGroceryList] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const fetchedRecipe = await getRecipe(recipeId);
      setRecipe(fetchedRecipe);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    try {
      await deleteRecipe(recipe.id);
      onBack(); // Return to recipe list after deletion
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    try {
      await toggleRecipeFavorite(recipe.id, !recipe.isFavorite);
      await loadRecipe(); // Reload the recipe to show updated favorite status
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  };

  const handleSave = async () => {
    setShowEditModal(false);
    await loadRecipe(); // Reload the recipe to show updated data
  };

  const handleAddToGroceryList = async () => {
    if (!recipe) return;
    
    try {
      setAddingToGroceryList(true);
      
      // Check if user already has items in the grocery list
      const userLists = await getUserShoppingLists('default-user');
      if (userLists.length > 0 && userLists[0].items.length > 0) {
        // Show confirmation dialog
        setShowGroceryListConfirm(true);
      } else {
        // No items in list, just add ingredients
        const loadingToast = toast.loading('Adding ingredients to your grocery list...');
        await addRecipeIngredientsToGroceryList(recipe);
        toast.dismiss(loadingToast);
        toast.success('Recipe ingredients added to your grocery list!');
        setAddingToGroceryList(false);
      }
    } catch (error) {
      console.error('Failed to add ingredients to grocery list:', error);
      toast.error('Failed to add ingredients to grocery list');
      setAddingToGroceryList(false);
    }
  };

  const handleClearAndAddToGroceryList = async () => {
    if (!recipe) return;
    
    try {
      // Close dialog but keep loading state
      setShowGroceryListConfirm(false);
      
      // Show loading toast
      const loadingToast = toast.loading('Clearing grocery list and adding ingredients...');
      
      // Clear the existing list and add the new ingredients
      const userLists = await getUserShoppingLists('default-user');
      if (userLists.length > 0) {
        const list = userLists[0];
        await updateShoppingList(list.id, { items: [] });
        await addRecipeIngredientsToGroceryList(recipe);
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Grocery list cleared and new ingredients added!');
      }
    } catch (error) {
      console.error('Failed to clear and add ingredients:', error);
      toast.error('Failed to update grocery list');
    } finally {
      setAddingToGroceryList(false);
    }
  };

  const handleAddToExistingGroceryList = async () => {
    if (!recipe) return;
    
    try {
      // Close dialog but keep loading state
      setShowGroceryListConfirm(false);
      
      // Show loading toast
      const loadingToast = toast.loading('Adding ingredients to grocery list...');
      
      // Add to existing list
      await addRecipeIngredientsToGroceryList(recipe);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Recipe ingredients added to your grocery list!');
    } catch (error) {
      console.error('Failed to add ingredients:', error);
      toast.error('Failed to update grocery list');
    } finally {
      setAddingToGroceryList(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-zinc-600">Recipe not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-violet-600 hover:text-violet-700"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="relative h-64 bg-zinc-200">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            No Image
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 text-zinc-600" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Add to Grocery List Button */}
          <button
            onClick={handleAddToGroceryList}
            className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
            title="Add to grocery list"
          >
            <ShoppingCartIcon className="w-5 h-5 text-zinc-600 hover:text-violet-600" />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
          >
            <PencilIcon className="w-5 h-5 text-zinc-600" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
          >
            <TrashIcon className="w-5 h-5 text-zinc-600 hover:text-red-500" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
          >
            {recipe.isFavorite ? (
              <HeartSolid className="w-5 h-5 text-violet-600" />
            ) : (
              <HeartIcon className="w-5 h-5 text-zinc-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">{recipe.name}</h1>
        
        {/* Source */}
        {recipe.source && (
          <div className="mb-4">
            <a
              href={recipe.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-violet-600 hover:text-violet-700"
            >
              {recipe.source.type === 'url' && <LinkIcon className="w-4 h-4 mr-1" />}
              {recipe.source.type === 'instagram' && <ShareIcon className="w-4 h-4 mr-1" />}
              {recipe.source.type === 'tiktok' && <VideoCameraIcon className="w-4 h-4 mr-1" />}
              <span>{recipe.source.title || 'View Source'}</span>
            </a>
          </div>
        )}
        
        {/* Meta Information */}
        <div className="flex gap-4 mb-6 text-sm text-zinc-600">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.mealTypes?.map((type) => (
            <span
              key={type}
              className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-sm"
            >
              {type}
            </span>
          ))}
          {recipe.cuisine?.map((cuisine) => (
            <span
              key={cuisine}
              className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-sm"
            >
              {cuisine}
            </span>
          ))}
        </div>

        {/* Description */}
        {recipe.description && (
          <p className="text-zinc-600 mb-6">{recipe.description}</p>
        )}

        {/* Ingredients */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients?.map((ingredient, index) => (
              <li key={index} className="flex items-baseline">
                <span className="font-medium text-zinc-900">
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <span className="ml-2 text-zinc-600">{ingredient.name}</span>
                {ingredient.notes && (
                  <span className="ml-2 text-sm text-zinc-500">
                    ({ingredient.notes})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Instructions */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions?.map((step) => (
              <li key={step.order} className="flex">
                <span className="font-medium text-violet-600 mr-4">
                  {step.order}.
                </span>
                <span className="text-zinc-600">{step.instruction}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Notes */}
        {recipe.notes && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">Notes</h2>
            <p className="text-zinc-600">{recipe.notes}</p>
          </section>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Edit Modal */}
      <RecipeEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSave}
        recipe={recipe}
      />

      {/* Confirmation Dialog for Grocery List */}
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
      
      {/* Toast notifications */}
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
  );
}; 