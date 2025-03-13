import React, { useState, useEffect, useRef } from 'react';
import { ShoppingListItem } from './ShoppingListItem';
import { StoreSelector } from './StoreSelector';
import { createShoppingList, getShoppingList, addItemToList, getUserShoppingLists, updateShoppingList } from '../firebase/firestore';
import { ShoppingList as ShoppingListType, NewShoppingItem, Category, Store, ViewMode } from '../types/index';
import { AddItemModal } from './AddItemModal';
import { 
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

// Since this is a single-user app, we'll use a constant ID
const USER_ID = 'default-user';

interface ShoppingListProps {
  viewMode: ViewMode;
  showCompleted: boolean;
  currentStore: string;
  showStoreFilter: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onShowCompletedChange: (show: boolean) => void;
  onCurrentStoreChange: (storeId: string) => void;
  onShowStoreFilterChange: (show: boolean) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  viewMode,
  showCompleted,
  currentStore,
  showStoreFilter,
  onViewModeChange,
  onShowCompletedChange,
  onCurrentStoreChange,
  onShowStoreFilterChange
}) => {
  const [list, setList] = useState<ShoppingListType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>(undefined);
  const [showConfig, setShowConfig] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Refs for click outside handling
  const storeFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeFilterRef.current && !storeFilterRef.current.contains(event.target as Node)) {
        setShowConfig(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleAddItem = async (item: NewShoppingItem) => {
    if (!list?.id) return;

    try {
      await addItemToList(list.id, item);
      setNewItemName('');
      setNewItemQuantity('1');
      setNewItemUnit('');
      setSelectedCategory(undefined);
      setSelectedStore(undefined);
      refreshList();
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  const handleViewModeChange = async (newMode: ViewMode) => {
    if (!list?.id) return;
    onViewModeChange(newMode);
    try {
      await updateShoppingList(list.id, { viewMode: newMode });
      refreshList();
    } catch (err) {
      console.error('Failed to update view mode:', err);
    }
  };

  const handleStoreFilterChange = async (storeId: string) => {
    if (!list?.id) return;
    onCurrentStoreChange(storeId);
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
    onShowCompletedChange(newShowCompleted);
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* List Content */}
      <div className="px-4 pt-4">
        {viewMode === 'sequential' ? (
          // Sequential view: Group by store, then by category
          <div className="space-y-4">
            {Object.entries(itemsByStore).map(([storeId, categorizedItems]) => {
              const store = list.stores.find((s: Store) => s.id === storeId);
              return (
                <div key={storeId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-3 py-2 bg-white border-b border-zinc-200">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-violet-600 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h2 className="text-sm font-medium text-zinc-900">
                        {store?.name || 'Unassigned Store'}
                      </h2>
                    </div>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {Object.entries(categorizedItems).map(([categoryId, items]) => {
                      const category = list.categories.find((c: Category) => c.id === categoryId);
                      return (
                        <div key={categoryId}>
                          <div className="px-3 py-1.5 bg-zinc-50/50">
                            <h3 className="text-xs font-medium text-zinc-700">
                              {category?.name || 'Uncategorized'}
                            </h3>
                          </div>
                          <div className="px-3 py-1">
                            <div className="space-y-1">
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
          <div className="space-y-3">
            {Object.entries(itemsByCategory).map(([categoryId, items]) => {
              const category = list.categories.find((c: Category) => c.id === categoryId);
              return (
                <div key={categoryId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="px-3 py-1.5 bg-zinc-50/50">
                    <h3 className="text-xs font-medium text-zinc-700">
                      {category?.name || 'Uncategorized'}
                    </h3>
                  </div>
                  <div className="px-3 py-1">
                    <div className="space-y-1">
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed right-4 bottom-20 inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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