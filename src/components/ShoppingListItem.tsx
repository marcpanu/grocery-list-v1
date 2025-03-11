import { useState } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);

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

  const handleNameUpdate = async () => {
    if (editedName.trim() === item.name) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateItemInList(listId, item.id, { name: editedName.trim() });
      onUpdate();
    } catch (err) {
      console.error('Failed to update name:', err);
      setEditedName(item.name);
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameUpdate();
    } else if (e.key === 'Escape') {
      setEditedName(item.name);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className={`group px-4 py-3 hover:bg-zinc-50 transition-colors ${
        isUpdating ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={handleToggleCheck}
            disabled={isUpdating}
            className="peer h-5 w-5 rounded-full border-2 border-zinc-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 transition-colors"
          />
          <div className="absolute inset-0 rounded-full peer-checked:bg-violet-600 transition-colors duration-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 6L5 8.5L9.5 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={handleKeyDown}
              className="flex-1 px-0 border-0 border-b-2 border-violet-500 focus:ring-0 bg-transparent text-zinc-900"
              autoFocus
            />
          ) : (
            <span 
              onClick={() => setIsEditing(true)}
              className={`font-medium cursor-text transition-colors ${
                item.checked 
                  ? 'line-through text-zinc-400' 
                  : 'text-zinc-900 hover:text-violet-600'
              }`}
            >
              {item.name}
            </span>
          )}
          {item.quantity > 1 && (
            <span className="text-sm text-zinc-500 tabular-nums whitespace-nowrap">
              × {item.quantity}{item.unit ? ` ${item.unit}` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <StoreSelector
            selectedStore={item.store}
            onStoreSelect={handleStoreSelect}
            className="w-40 hidden sm:block"
          />
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors"
            title="Delete item"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 