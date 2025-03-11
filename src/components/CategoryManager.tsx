import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category } from '../types';
import { deleteCategory, reorderCategories } from '../firebase/firestore';

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
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const fetchedCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
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
      const categoriesRef = collection(db, 'categories');
      const newCategory = {
        name: newCategoryName.trim(),
        order: categories.length // Add to end of list
      };
      
      await addDoc(categoriesRef, newCategory);
      setNewCategoryName('');
      loadCategories(); // Refresh the list
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
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
      loadCategories(); // Reload original order on error
    }
  };

  if (isLoading) return <div className="p-4">Loading categories...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
      
      {/* Add new category form */}
      <form onSubmit={handleAddCategory} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newCategoryName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isAdding ? 'Adding...' : 'Add Category'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </form>

      {/* List existing categories */}
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Existing Categories</h3>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <span>{category.name}</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveCategory(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveCategory(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                  >
                    ↓
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-500">No categories added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}; 