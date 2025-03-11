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
    <div className="max-w-4xl mx-auto p-4">
      {/* View Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <StoreSelector
            selectedStore={list.stores.find(s => s.id === currentStore)}
            onStoreSelect={(store) => handleStoreFilterChange(store?.id || 'all')}
            allowAllStores
            className="w-40"
          />
          <select
            value={viewMode}
            onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
            className="p-2 border rounded bg-white"
          >
            <option value="combined">Combined View</option>
            <option value="sequential">Sequential View</option>
          </select>
        </div>
        <button
          onClick={handleToggleCompleted}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </button>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              min="1"
              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              placeholder="Unit"
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <CategorySelector
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              className="flex-1"
            />
            <StoreSelector
              selectedStore={selectedStore}
              onStoreSelect={setSelectedStore}
              className="flex-1"
            />
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* Items List */}
      <div className="space-y-6">
        {viewMode === 'sequential' ? (
          // Sequential view: Group by store, then by category
          <div className="space-y-8">
            {Object.entries(itemsByStore).map(([storeId, categorizedItems]) => {
              const store = list.stores.find((s: Store) => s.id === storeId);
              return (
                <div key={storeId} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-semibold">
                    {store?.name || 'Unassigned Store'}
                  </div>
                  <div className="divide-y">
                    {Object.entries(categorizedItems).map(([categoryId, items]) => {
                      const category = list.categories.find((c: Category) => c.id === categoryId);
                      return (
                        <div key={categoryId} className="p-4">
                          <h3 className="font-medium text-gray-700 mb-2">
                            {category?.name || 'Uncategorized'}
                          </h3>
                          <div className="space-y-2">
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
                </div>
              );
            })}
          </div>
        ) : (
          // Combined view: Group by category only
          <div className="space-y-6">
            {Object.entries(itemsByCategory).map(([categoryId, items]) => {
              const category = list.categories.find((c: Category) => c.id === categoryId);
              return (
                <div key={categoryId} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-semibold">
                    {category?.name || 'Uncategorized'}
                  </div>
                  <div className="divide-y">
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
          <div className="text-center text-gray-500 mt-8">
            No items in your shopping list
          </div>
        )}
      </div>
    </div>
  );
}; 