import React, { useState, useEffect } from 'react';
import { addStore, getStores } from '../firebase/firestore';
import { Store } from '../types';

export const StoreManager: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      try {
        console.log('Loading stores...');
        const fetchedStores = await getStores();
        console.log('Fetched stores:', fetchedStores);
        setStores(fetchedStores);
      } catch (err) {
        console.error('Error loading stores:', err);
        setError('Failed to load stores');
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

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
      
      const addedStore = await addStore(newStore);
      console.log('Added store:', addedStore);
      setStores([...stores, addedStore]);
      setNewStoreName('');
    } catch (err) {
      console.error('Error adding store:', err);
      setError('Failed to add store');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading stores...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-blue-500 underline"
        >
          Retry
        </button>
      </div>
    );
  }

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
              <span className="text-gray-500">Order: {store.order}</span>
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