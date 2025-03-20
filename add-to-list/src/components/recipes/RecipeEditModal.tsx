import { Recipe } from '../../types/recipe';
import { RecipeEditForm } from './RecipeEditForm';

interface RecipeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  recipe: Recipe;
}

export const RecipeEditModal = ({ isOpen, onClose, onSave, recipe }: RecipeEditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 sm:align-middle">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-medium leading-6 text-zinc-900 mb-6">
                Edit Recipe
              </h3>
              <RecipeEditForm
                recipe={recipe}
                onSave={onSave}
                onCancel={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 