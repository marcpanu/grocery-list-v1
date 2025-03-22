import { useState, useEffect } from 'react';
import { addStore, getStores, deleteStore, reorderStores, getUserPreferences, updateUserPreferences } from '../firebase/firestore';
import { Store } from '../types';

export const StoreManager: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaultStore, setDefaultStore] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fetchedStores = await getStores();
      setStores(fetchedStores);

      // Get user preferences to check for default store
      const preferences = await getUserPreferences();
      if (preferences && preferences.defaultStore) {
        setDefaultStore(preferences.defaultStore);
      } else {
        // If no default store is set and we have stores, set the first one as default
        if (fetchedStores.length > 0) {
          setDefaultStore(fetchedStores[0].id);
          await updateUserPreferences({ defaultStore: fetchedStores[0].id });
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
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
        order: stores.length,
        isActive: true
      };
      const addedStore = await addStore(newStore);
      
      // If this is the first store, set it as default
      if (stores.length === 0) {
        setDefaultStore(addedStore.id);
        await updateUserPreferences({ defaultStore: addedStore.id });
      }
      
      setNewStoreName('');
      loadData();
    } catch (err) {
      setError('Failed to add store');
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSetDefaultStore = async (storeId: string) => {
    try {
      setDefaultStore(storeId);
      await updateUserPreferences({ defaultStore: storeId });
    } catch (err) {
      setError('Failed to set default store');
      console.error(err);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await deleteStore(storeId);
      
      // If we're deleting the default store, update the default
      if (defaultStore === storeId) {
        const remainingStores = stores.filter(store => store.id !== storeId);
        if (remainingStores.length > 0) {
          setDefaultStore(remainingStores[0].id);
          await updateUserPreferences({ defaultStore: remainingStores[0].id });
        } else {
          setDefaultStore(null);
          await updateUserPreferences({ defaultStore: null });
        }
      }
      
      loadData();
    } catch (err) {
      setError('Failed to delete store');
      console.error(err);
    }
  };

  const handleMoveStore = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stores.length - 1)
    ) {
      return;
    }

    const newStores = [...stores];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newStores[index], newStores[newIndex]] = [newStores[newIndex], newStores[index]];

    try {
      await reorderStores(newStores);
      setStores(newStores);
    } catch (err) {
      setError('Failed to reorder stores');
      console.error(err);
      loadData();
    }
  };

  if (isLoading) return <div>Loading stores...</div>;

  return (
    <div>
      {/* Add new store form */}
      <form onSubmit={handleAddStore} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder="Add a new store"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newStoreName.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add Store'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      {/* List existing stores */}
      <div className="mb-2 text-sm text-zinc-700 font-medium">
        Select your default store:
      </div>
      <div className="space-y-2">
        {stores.map((store, index) => (
          <div
            key={store.id}
            className="flex items-center justify-between py-2 group"
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={`default-store-${store.id}`}
                name="default-store"
                checked={defaultStore === store.id}
                onChange={() => handleSetDefaultStore(store.id)}
                className="rounded-full border-zinc-300 text-violet-600 focus:ring-violet-500"
              />
              <label
                htmlFor={`default-store-${store.id}`}
                className="text-sm text-gray-900 cursor-pointer"
              >
                {store.name}
              </label>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveStore(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveStore(index, 'down')}
                  disabled={index === stores.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
              <button
                onClick={() => handleDeleteStore(store.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete store"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        {stores.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No stores added yet
          </p>
        )}
      </div>
    </div>
  );
}; 