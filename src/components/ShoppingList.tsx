import React, { useState, useEffect } from 'react';
import { ShoppingListItem } from './ShoppingListItem';
import { createShoppingList, getShoppingList, addItemToList, getUserShoppingLists, updateItemInList } from '../firebase/firestore';
import { ShoppingList as ShoppingListType, NewShoppingItem, Category, Store, ViewMode, ShoppingItem } from '../types/index';
import { AddItemModal } from './AddItemModal';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

// Since this is a single-user app, we'll use a constant ID
const USER_ID = 'default';

interface ShoppingListProps {
  viewMode: ViewMode;
  showCompleted: boolean;
  currentStoreId: string;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  viewMode,
  showCompleted,
  currentStoreId,
}) => {
  const [list, setList] = useState<ShoppingListType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>([]);

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
        setItems(activeList.items);
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
        setItems(updatedList.items);
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

  // Simplified filter and sort items function
  const getFilteredAndSortedItems = () => {
    if (!list) return [];

    // First filter by completion status
    let items = showCompleted 
      ? list.items 
      : list.items.filter(item => !item.checked);

    // Simple store filter - only filter if not "all"
    if (currentStoreId !== 'all') {
      items = items.filter(item => item.store?.id === currentStoreId);
    }

    // Sort by category order, then by item order within categories
    return items.sort((a, b) => {
      // First sort by category order
      const categoryOrderA = a.category?.order ?? Number.MAX_SAFE_INTEGER;
      const categoryOrderB = b.category?.order ?? Number.MAX_SAFE_INTEGER;
      
      if (categoryOrderA !== categoryOrderB) {
        return categoryOrderA - categoryOrderB;
      }
      
      // If same category, sort by item order
      const itemOrderA = a.order ?? 0;
      const itemOrderB = b.order ?? 0;
      return itemOrderA - itemOrderB;
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Drop was cancelled or dropped outside a droppable
    if (!destination || !list) return;

    // Find the item being dragged
    const item = list.items.find(item => item.id === draggableId);
    if (!item) return;

    // Parse the droppable IDs to get context
    const [destType, ...destParts] = destination.droppableId.split('-');
    const [...sourceParts] = source.droppableId.split('-');

    try {
      const updates: Partial<ShoppingItem> = {};
      let reorder = false;

      // Handle different types of drops
      if (destType === 'sequence') {
        // Format: sequence-{storeId}-{categoryId}
        const [destStoreId, destCategoryId] = destParts;
        const [sourceStoreId, sourceCategoryId] = sourceParts;
        
        if (destStoreId && destStoreId !== sourceStoreId) {
          const newStore = list.stores.find(s => s.id === destStoreId);
          if (newStore) {
            updates.store = newStore;
          }
        }
        
        if (destCategoryId && destCategoryId !== sourceCategoryId) {
          const newCategory = list.categories.find(c => c.id === destCategoryId);
          if (newCategory) {
            updates.category = newCategory;
          }
        }

        reorder = true;
      } else if (destType === 'store' && destParts[0]) {
        // Format: store-{storeId}
        const newStore = list.stores.find(s => s.id === destParts[0]);
        if (newStore && item.store?.id !== newStore.id) {
          updates.store = newStore;
        }
      } else if (destType === 'category' && destParts[0]) {
        // Format: category-{categoryId}
        const newCategory = list.categories.find(c => c.id === destParts[0]);
        if (newCategory && item.category?.id !== newCategory.id) {
          updates.category = newCategory;
        }
      }

      // If we have updates or need to reorder, apply them
      if (Object.keys(updates).length > 0 || reorder) {
        // Get all items in the destination container for reordering
        const itemsInDestination = list.items.filter(i => {
          if (destType === 'sequence') {
            const [destStoreId, destCategoryId] = destParts;
            return (destStoreId ? i.store?.id === destStoreId : !i.store) && 
                   (destCategoryId ? i.category?.id === destCategoryId : !i.category);
          } else if (destType === 'store') {
            return destParts[0] ? i.store?.id === destParts[0] : !i.store;
          } else {
            return destParts[0] ? i.category?.id === destParts[0] : !i.category;
          }
        });

        // Remove the dragged item from the array if it's there
        const itemsWithoutDragged = itemsInDestination.filter(i => i.id !== item.id);
        
        // Insert the dragged item at the new position
        const newItems = [
          ...itemsWithoutDragged.slice(0, destination.index),
          item,
          ...itemsWithoutDragged.slice(destination.index)
        ];

        // Update the order field for all affected items
        const orderUpdates = newItems.map((item, index) => ({
          id: item.id,
          updates: { order: index }
        }));

        // Apply updates to the dragged item
        await updateItemInList(list.id, item.id, { 
          ...updates, 
          order: destination.index 
        });

        // If reordering, update the order of other items
        if (reorder) {
          await Promise.all(
            orderUpdates
              .filter(update => update.id !== item.id)
              .map(update => updateItemInList(list.id, update.id, update.updates))
          );
        }

        refreshList();
      }
    } catch (err) {
      console.error('Failed to update item:', err);
      setError('Failed to update item');
    }
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
        <DragDropContext onDragEnd={handleDragEnd}>
          {viewMode === 'sequential' ? (
            <div className="space-y-4">
              {Object.entries(itemsByStore).map(([storeId, categorizedItems]) => {
                const store = list?.stores.find((s: Store) => s.id === storeId);
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
                    {/* Store droppable area */}
                    <Droppable droppableId={`store-${storeId}`}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`divide-y divide-zinc-100 ${
                            snapshot.isDraggingOver ? 'bg-violet-50' : ''
                          }`}
                        >
                          {Object.entries(categorizedItems).map(([categoryId, items]) => {
                            const category = list?.categories.find((c: Category) => c.id === categoryId);
                            return (
                              <div key={categoryId}>
                                <div className="px-3 py-1.5 bg-zinc-50/50">
                                  <h3 className="text-xs font-medium text-zinc-700">
                                    {category?.name || 'Uncategorized'}
                                  </h3>
                                </div>
                                {/* Sequence droppable area */}
                                <Droppable droppableId={`sequence-${storeId}-${categoryId}`}>
                                  {(seqProvided, seqSnapshot) => (
                                    <div 
                                      ref={seqProvided.innerRef}
                                      {...seqProvided.droppableProps}
                                      className={`px-3 py-1 ${
                                        seqSnapshot.isDraggingOver ? 'bg-violet-50/50' : ''
                                      }`}
                                    >
                                      <div className="space-y-1">
                                        {items.map((item, index) => (
                                          <ShoppingListItem
                                            key={item.id}
                                            item={item}
                                            listId={list?.id || ''}
                                            onUpdate={refreshList}
                                            index={index}
                                          />
                                        ))}
                                      </div>
                                      {seqProvided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(itemsByCategory).map(([categoryId, items]) => {
                const category = list?.categories.find((c: Category) => c.id === categoryId);
                return (
                  <div key={categoryId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-3 py-1.5 bg-zinc-50/50">
                      <h3 className="text-xs font-medium text-zinc-700">
                        {category?.name || 'Uncategorized'}
                      </h3>
                    </div>
                    {/* Category droppable area */}
                    <Droppable droppableId={`category-${categoryId}`}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`px-3 py-1 ${
                            snapshot.isDraggingOver ? 'bg-violet-50/50' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            {items.map((item, index) => (
                              <ShoppingListItem
                                key={item.id}
                                item={item}
                                listId={list?.id || ''}
                                onUpdate={refreshList}
                                index={index}
                              />
                            ))}
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          )}
        </DragDropContext>
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
        items={items}
      />
    </div>
  );
}; 