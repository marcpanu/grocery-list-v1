import React, { useState } from 'react';
import { ShoppingItem, Store } from '../types';
import { StoreSelector } from './StoreSelector';
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
    <div className={`p-3 ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={handleToggleCheck}
          disabled={isUpdating}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={`font-medium ${item.checked ? 'line-through text-gray-500' : ''}`}>
              {item.name}
            </span>
            {item.quantity > 1 && (
              <span className="text-sm text-gray-500">
                × {item.quantity}{item.unit ? ` ${item.unit}` : ''}
              </span>
            )}
          </div>
          {item.category && (
            <div className="text-sm text-gray-500">
              {item.category.name}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StoreSelector
            selectedStore={item.store}
            onStoreSelect={handleStoreSelect}
            className="w-40"
          />
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}; 