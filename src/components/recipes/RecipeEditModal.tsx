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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-500 bg-opacity-75">
      <div className="flex min-h-screen items-start justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Modal panel */}
        <div className="relative inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-3xl sm:align-middle">
          {/* Close button */}
          <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-zinc-900 mb-6">
                  Edit Recipe
                </h3>
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
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
      </div>
    </div>
  );
}; 