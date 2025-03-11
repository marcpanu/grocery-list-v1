import React, { useState, useEffect } from 'react';
import { addStore, getStores } from '../firebase/firestore';
import { Store } from '../types';

export const StoreManager: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const fetchedStores = await getStores();
      setStores(fetchedStores);
    } catch (err) {
      console.error('Failed to load stores:', err);
      setError('Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      const newStore: Omit<Store, 'id'> = {
        name: newStoreName.trim(),
        order: stores.length // Add to end of list
      };
      await addStore(newStore);
      setNewStoreName('');
      loadStores(); // Refresh the list
    } catch (err) {
      setError('Failed to add store');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading stores...</div>;

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

      {/* List existing stores */}
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Existing Stores</h3>
        <div className="space-y-2">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <span>{store.name}</span>
              <span className="text-gray-500">#{store.order + 1}</span>
            </div>
          ))}
          {stores.length === 0 && (
            <p className="text-gray-500">No stores added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}; 