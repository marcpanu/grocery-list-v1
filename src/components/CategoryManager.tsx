import React, { useState, useEffect } from 'react';
import { addCategory, getCategories, deleteCategory, reorderCategories } from '../firebase/firestore';
import { Category } from '../types';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const newCategory: Omit<Category, 'id'> = {
        name: newCategoryName.trim(),
        order: categories.length
      };
      await addCategory(newCategory);
      setNewCategoryName('');
      loadCategories();
    } catch (err) {
      setError('Failed to add category');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      loadCategories();
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];

    try {
      await reorderCategories(newCategories);
      setCategories(newCategories);
    } catch (err) {
      setError('Failed to reorder categories');
      console.error(err);
      loadCategories();
    }
  };

  if (isLoading) return <div>Loading categories...</div>;

  return (
    <div>
      {/* Add new category form */}
      <form onSubmit={handleAddCategory} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Add a new category"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newCategoryName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add Category'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      {/* List existing categories */}
      <div className="space-y-2">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="flex items-center justify-between py-2 group"
          >
            <span className="text-sm text-gray-900">{category.name}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveCategory(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveCategory(index, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete category"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No categories added yet
          </p>
        )}
      </div>
    </div>
  );
}; 