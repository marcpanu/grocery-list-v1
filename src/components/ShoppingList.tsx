import React, { useState, useEffect } from 'react';
import { ShoppingListItem } from './ShoppingListItem';
import { CategorySelector } from './CategorySelector';
import { StoreSelector } from './StoreSelector';
import { createShoppingList, getShoppingList, addItemToList, getUserShoppingLists, updateShoppingList } from '../firebase/firestore';
import { ShoppingList as ShoppingListType, NewShoppingItem, Category, Store, ViewMode } from '../types/index';

// Since this is a single-user app, we'll use a constant ID
const USER_ID = 'default-user';

export const ShoppingList: React.FC = () => {
  const [list, setList] = useState<ShoppingListType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedStore, setSelectedStore] = useState<Store>();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [showCompleted, setShowCompleted] = useState(true);
  const [currentStore, setCurrentStore] = useState<string>('all');

  useEffect(() => {
    const initializeList = async () => {
      try {
        const userLists = await getUserShoppingLists(USER_ID);
        
        let activeList: ShoppingListType;
        if (userLists.length > 0) {
          activeList = userLists[0];
        } else {
          activeList = await createShoppingList(USER_ID, 'Shopping List');
        }
        
        setList(activeList);
        // Initialize view state from list settings
        setViewMode(activeList.viewMode || 'combined');
        setShowCompleted(activeList.showCompleted ?? true);
        setCurrentStore(activeList.currentStore || 'all');
      } catch (err) {
        setError('Failed to initialize shopping list');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializeList();
  }, []);

  const refreshList = async () => {
    if (!list?.id) return;
    
    try {
      const updatedList = await getShoppingList(list.id);
      if (updatedList) {
        setList(updatedList);
      } else {
        setError('Shopping list not found');
      }
    } catch (err) {
      setError('Failed to refresh list');
      console.error(err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!list?.id || !newItemName.trim()) return;

    try {
      const newItem: NewShoppingItem = {
        name: newItemName.trim(),
        quantity: Number(newItemQuantity),
        unit: newItemUnit.trim() || undefined,
        category: selectedCategory,
        store: selectedStore,
        checked: false
      };

      await addItemToList(list.id, newItem);
      setNewItemName('');
      setNewItemQuantity('1');
      setNewItemUnit('');
      setSelectedCategory(undefined);
      setSelectedStore(undefined);
      refreshList();
    } catch (err) {
      setError('Failed to add item');
      console.error(err);
    }
  };

  const handleViewModeChange = async (newMode: ViewMode) => {
    if (!list?.id) return;
    setViewMode(newMode);
    try {
      await updateShoppingList(list.id, { viewMode: newMode });
      refreshList();
    } catch (err) {
      console.error('Failed to update view mode:', err);
    }
  };

  const handleStoreFilterChange = async (storeId: string) => {
    if (!list?.id) return;
    setCurrentStore(storeId);
    try {
      await updateShoppingList(list.id, { currentStore: storeId });
      refreshList();
    } catch (err) {
      console.error('Failed to update store filter:', err);
    }
  };

  const handleToggleCompleted = async () => {
    if (!list?.id) return;
    const newShowCompleted = !showCompleted;
    setShowCompleted(newShowCompleted);
    try {
      await updateShoppingList(list.id, { showCompleted: newShowCompleted });
      refreshList();
    } catch (err) {
      console.error('Failed to toggle completed items:', err);
    }
  };

  // Filter and sort items
  const getFilteredAndSortedItems = () => {
    if (!list) return [];

    // First filter by completion status
    let items = showCompleted 
      ? list.items 
      : list.items.filter(item => !item.checked);

    // Then filter by current store if not in "all" view
    if (currentStore !== 'all') {
      items = items.filter(item => item.store?.id === currentStore);
    }

    // Sort by category order
    return items.sort((a, b) => {
      const orderA = a.category?.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.category?.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!list) return <div>No list found</div>;

  const filteredItems = getFilteredAndSortedItems();

  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const categoryId = item.category?.id || 'uncategorized';
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  // Group items by store, then by category
  const itemsByStore = filteredItems.reduce((acc, item) => {
    const storeId = item.store?.id || 'unassigned';
    if (!acc[storeId]) {
      acc[storeId] = {};
    }
    const categoryId = item.category?.id || 'uncategorized';
    if (!acc[storeId][categoryId]) {
      acc[storeId][categoryId] = [];
    }
    acc[storeId][categoryId].push(item);
    return acc;
  }, {} as Record<string, Record<string, typeof filteredItems>>);

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <StoreSelector
                selectedStore={list.stores.find(s => s.id === currentStore)}
                onStoreSelect={(store) => handleStoreFilterChange(store?.id || 'all')}
                allowAllStores
                className="w-44"
              />
              <select
                value={viewMode}
                onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
                className="w-44 rounded-md border-slate-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="combined">Combined View</option>
                <option value="sequential">Sequential View</option>
              </select>
            </div>
            <button
              onClick={handleToggleCompleted}
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="mt-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Add an item"
                  className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  min="1"
                  placeholder="Qty"
                  className="w-20 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="Unit"
                  className="w-24 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  className="w-44"
                />
                <StoreSelector
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                  className="w-44"
                />
                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 bg-white divide-y divide-slate-200">
        {viewMode === 'sequential' ? (
          // Sequential view: Group by store, then by category
          <div className="divide-y divide-slate-200">
            {Object.entries(itemsByStore).map(([storeId, categorizedItems]) => {
              const store = list.stores.find((s: Store) => s.id === storeId);
              return (
                <div key={storeId}>
                  <div className="px-4 py-3 bg-slate-50 sm:px-6">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {store?.name || 'Unassigned Store'}
                    </h2>
                  </div>
                  {Object.entries(categorizedItems).map(([categoryId, items]) => {
                    const category = list.categories.find((c: Category) => c.id === categoryId);
                    return (
                      <div key={categoryId}>
                        <div className="px-4 py-2 bg-slate-50/50 sm:px-6">
                          <h3 className="text-xs font-medium text-slate-500">
                            {category?.name || 'Uncategorized'}
                          </h3>
                        </div>
                        <div>
                          {items.map(item => (
                            <ShoppingListItem
                              key={item.id}
                              item={item}
                              listId={list.id}
                              onUpdate={refreshList}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          // Combined view: Group by category only
          <div className="divide-y divide-slate-200">
            {Object.entries(itemsByCategory).map(([categoryId, items]) => {
              const category = list.categories.find((c: Category) => c.id === categoryId);
              return (
                <div key={categoryId}>
                  <div className="px-4 py-2 bg-slate-50/50 sm:px-6">
                    <h3 className="text-xs font-medium text-slate-500">
                      {category?.name || 'Uncategorized'}
                    </h3>
                  </div>
                  <div>
                    {items.map(item => (
                      <ShoppingListItem
                        key={item.id}
                        item={item}
                        listId={list.id}
                        onUpdate={refreshList}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="px-4 py-12 text-center sm:px-6">
            <p className="text-sm text-slate-500">
              No items in your shopping list
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 