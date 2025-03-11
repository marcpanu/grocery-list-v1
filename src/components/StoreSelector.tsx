import React, { useEffect, useState } from 'react';
import { Store } from '../types/index';
import { getStores } from '../firebase/firestore';

export interface StoreSelectorProps {
  selectedStore: Store | undefined;
  onStoreSelect: (store: Store | undefined) => void;
  allowAllStores?: boolean;
  className?: string;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  selectedStore,
  onStoreSelect,
  allowAllStores = false,
  className = ''
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const fetchedStores = await getStores();
        setStores(fetchedStores);
      } catch (err) {
        setError('Failed to load stores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  if (loading) return <div>Loading stores...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <select
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${className}`}
      value={selectedStore?.id || ''}
      onChange={(e) => {
        if (e.target.value === 'all') {
          onStoreSelect(undefined);
          return;
        }
        const store = stores.find(s => s.id === e.target.value);
        onStoreSelect(store);
      }}
    >
      <option value="">Select a store</option>
      {allowAllStores && <option value="all">All Stores</option>}
      {stores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </select>
  );
}; 