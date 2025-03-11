//import React from 'react';
import { useGrocery } from '../context/GroceryContext';
import { CATEGORIES, STORES, Store } from '../types';

export function GroceryList() {
  const { state, dispatch } = useGrocery();
  const { items, showCompleted, currentStore, viewMode } = state;

  // First filter by completion status
  const visibleItems = items.filter((item) =>
    showCompleted || !item.completed
  );

  // Then filter by current store if not in "all" view
  const filteredItems = currentStore === 'all'
    ? visibleItems
    : visibleItems.filter(item => item.currentStore === currentStore);

  const getStoreColor = (storeId: string) => {
    switch (storeId) {
      case 'farmers-market':
        return 'text-green-600';
      case 'publix':
        return 'text-blue-600';
      case 'whole-foods':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  const sortedItems = [...filteredItems].sort((a, b) => {
    const catA = CATEGORIES.find((cat) => cat.id === a.category)?.sortOrder || 0;
    const catB = CATEGORIES.find((cat) => cat.id === b.category)?.sortOrder || 0;
    return catA - catB;
  });

  const renderStoreSection = (store: Store, items: typeof sortedItems) => {
    // In sequential view, only show items for the current store
    // In combined view, show all filtered items
    const storeItems = viewMode === 'sequential'
      ? items.filter(item => item.currentStore === store.id)
      : items;

    if (storeItems.length === 0) return null;

    const itemsByCategory = CATEGORIES.map((category) => ({
      category,
      items: storeItems.filter((item) => item.category === category.id),
    })).filter((group) => group.items.length > 0);

    return (
      <div key={store.id} className="mb-8">
        {viewMode === 'sequential' && (
          <h2 className="text-xl font-semibold mb-4">{store.name}</h2>
        )}
        {itemsByCategory.map(({ category, items }) => (
          <div key={category.id} className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">{category.name}</h3>
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => dispatch({ type: 'TOGGLE_ITEM', payload: item.id })}
                      className="h-5 w-5 rounded border-gray-300"
                    />
                    <span className={item.completed ? 'line-through text-gray-500' : ''}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {viewMode === 'combined' && (
                      <span className={`text-sm ${getStoreColor(item.currentStore)}`}>
                        {STORES.find(s => s.id === item.currentStore)?.name}
                      </span>
                    )}
                    <select
                      value={item.currentStore}
                      onChange={(e) =>
                        dispatch({
                          type: 'MOVE_ITEM',
                          payload: { itemId: item.id, storeId: e.target.value },
                        })
                      }
                      className="p-1 text-sm border rounded bg-white"
                    >
                      {STORES.slice(1).map((store) => (
                        <option key={store.id} value={store.id}>
                          {store.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_ITEM', payload: item.id })}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <select
            value={currentStore}
            onChange={(e) => dispatch({ type: 'SET_CURRENT_STORE', payload: e.target.value })}
            className="p-2 border rounded bg-white"
          >
            {STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <select
            value={viewMode}
            onChange={(e) => dispatch({ type: 'SET_VIEW_MODE', payload: e.target.value as 'combined' | 'sequential' })}
            className="p-2 border rounded bg-white"
          >
            <option value="combined">Combined View</option>
            <option value="sequential">Sequential View</option>
          </select>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SHOW_COMPLETED' })}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </button>
      </div>

      {viewMode === 'sequential' ? (
        <>
          {STORES.slice(1).map((store) => renderStoreSection(store, sortedItems))}
          {!sortedItems.length && (
            <div className="text-center text-gray-500 mt-8">
              No items in your shopping list
            </div>
          )}
          {sortedItems.length > 0 && !STORES.slice(1).some(store => 
            sortedItems.some(item => item.currentStore === store.id)
          ) && (
            <div className="text-center text-gray-500 mt-8">
              All items have been completed
            </div>
          )}
        </>
      ) : (
        renderStoreSection(STORES[0], sortedItems)
      )}
    </div>
  );
} 