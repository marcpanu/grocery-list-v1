import React, { useState } from 'react';
import { ShoppingItem, Store, Category } from '../types';
import { StoreSelector } from './StoreSelector';
import { CategorySelector } from './CategorySelector';
import { updateItemInList, removeItemFromList, toggleItemCheck } from '../firebase/firestore';

interface ShoppingListItemProps {
  item: ShoppingItem;
  listId: string;
  onUpdate: () => void;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  listId,
  onUpdate
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStoreSelect = async (store: Store | undefined) => {
    setIsUpdating(true);
    try {
      await updateItemInList(listId, item.id, { store });
      onUpdate();
    } catch (err) {
      console.error('Failed to update store:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCategorySelect = async (category: Category | undefined) => {
    setIsUpdating(true);
    try {
      await updateItemInList(listId, item.id, { category });
      onUpdate();
    } catch (err) {
      console.error('Failed to update category:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleCheck = async () => {
    setIsUpdating(true);
    try {
      await toggleItemCheck(listId, item.id, !item.checked);
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle check:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItemFromList(listId, item.id);
      onUpdate();
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`p-4 border-b ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={handleToggleCheck}
          disabled={isUpdating}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${item.checked ? 'line-through text-gray-500' : ''}`}>
              {item.name}
            </span>
            <span className="text-sm text-gray-600">
              {item.quantity} {item.unit}
            </span>
          </div>
          
          <div className="mt-2 space-y-2">
            <CategorySelector
              selectedCategory={item.category}
              onCategorySelect={handleCategorySelect}
              className="text-sm"
            />
            <StoreSelector
              selectedStore={item.store}
              onStoreSelect={handleStoreSelect}
              className="text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
}; 