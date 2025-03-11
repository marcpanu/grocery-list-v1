import React, { useState } from 'react';
import { addStore } from '../firebase/firestore';
import { Store } from '../types/shopping-list';
import { StoreSelector } from './StoreSelector';

export const StoreManager: React.FC = () => {
  const [newStoreName, setNewStoreName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const newStore: Omit<Store, 'id'> = {
        name: newStoreName.trim(),
        order: 0 // Default order
      };
      await addStore(newStore);
      setNewStoreName('');
    } catch (err) {
      setError('Failed to add store');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Manage Stores</h2>
      
      {/* Add new store form */}
      <form onSubmit={handleAddStore} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder="Enter store name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newStoreName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {isAdding ? 'Adding...' : 'Add Store'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </form>

      {/* View existing stores */}
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Existing Stores</h3>
        <StoreSelector
          selectedStore={undefined}
          onStoreSelect={() => {}}
          className="max-w-md"
        />
      </div>
    </div>
  );
}; 