import React, { useState } from 'react';
import { useGrocery } from '../context/GroceryContext';
import { CATEGORIES, STORES } from '../types';

export function ItemInput() {
  const { dispatch } = useGrocery();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [store, setStore] = useState(STORES[1].id); // Skip 'All Stores' as default

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: Date.now().toString(),
        name: name.trim(),
        category,
        completed: false,
        currentStore: store,
        preferredStores: [store],
      },
    });

    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add new item..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 p-2 border rounded bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="flex-1 p-2 border rounded bg-white"
          >
            {STORES.slice(1).map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
} 