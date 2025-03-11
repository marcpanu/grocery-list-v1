import React, { useState, useEffect } from 'react';
import { ShoppingListItem } from './ShoppingListItem';
import { StoreSelector } from './StoreSelector';
import { createShoppingList, getShoppingList, addItemToList, getUserShoppingLists, updateShoppingList } from '../firebase/firestore';
import { ShoppingList as ShoppingListType, NewShoppingItem, Category, Store, ViewMode } from '../types/index';
import { AddItemModal } from './AddItemModal';

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const handleAddItem = async (newItem: NewShoppingItem) => {
    if (!list?.id) return;

    try {
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
    <div className="h-full flex flex-col bg-zinc-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-zinc-100 pt-4">
        <div className="px-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-4 py-3">
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
                    className="w-44 rounded-md border-zinc-300 bg-white text-sm shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  >
                    <option value="combined">Combined View</option>
                    <option value="sequential">Sequential View</option>
                  </select>
                </div>
                <button
                  onClick={handleToggleCompleted}
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                >
                  {showCompleted ? 'Hide Completed' : 'Show Completed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 p-4 pt-2">
        {viewMode === 'sequential' ? (
          // Sequential view: Group by store, then by category
          <div className="space-y-4">
            {Object.entries(itemsByStore).map(([storeId, categorizedItems]) => {
              const store = list.stores.find((s: Store) => s.id === storeId);
              return (
                <div key={storeId} className="bg-white rounded-lg shadow-sm">
                  <div className="px-4 py-3 bg-zinc-50/80 sm:px-6">
                    <h2 className="text-base font-bold text-zinc-900">
                      {store?.name || 'Unassigned Store'}
                    </h2>
                  </div>
                  <div className="divide-y divide-zinc-200">
                    {Object.entries(categorizedItems).map(([categoryId, items]) => {
                      const category = list.categories.find((c: Category) => c.id === categoryId);
                      return (
                        <div key={categoryId}>
                          <div className="px-4 py-2 bg-zinc-50/50 sm:px-6">
                            <h3 className="text-sm font-medium text-zinc-700">
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
                </div>
              );
            })}
          </div>
        ) : (
          // Combined view: Group by category only
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y divide-zinc-200">
              {Object.entries(itemsByCategory).map(([categoryId, items]) => {
                const category = list.categories.find((c: Category) => c.id === categoryId);
                return (
                  <div key={categoryId}>
                    <div className="px-4 py-2 bg-zinc-50/50 sm:px-6">
                      <h3 className="text-sm font-medium text-zinc-700">
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

            {filteredItems.length === 0 && (
              <div className="px-4 py-12 text-center sm:px-6">
                <p className="text-sm text-zinc-500">
                  No items in your shopping list
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed right-4 bottom-20 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-colors flex items-center justify-center"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItem}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemQuantity={newItemQuantity}
        setNewItemQuantity={setNewItemQuantity}
        newItemUnit={newItemUnit}
        setNewItemUnit={setNewItemUnit}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
      />
    </div>
  );
}; 