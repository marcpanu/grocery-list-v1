import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category } from '../types';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
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
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

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
      
      // Refresh categories
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const updatedCategories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(updatedCategories);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category');
    } finally {
      setIsAdding(false);
    }
  };

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
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <span>{category.name}</span>
              <span className="text-gray-500">Order: {category.order}</span>
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