import { useState, useRef, useEffect } from 'react';
import { ShoppingItem, Store } from '../types';
import { StoreSelector } from './StoreSelector';
import { updateItemInList, removeItemFromList, toggleItemCheck } from '../firebase/firestore';
import { Draggable } from '@hello-pangea/dnd';
import { Bars3Icon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

interface ShoppingListItemProps {
  item: ShoppingItem;
  listId: string;
  onUpdate: () => void;
  index: number;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  listId,
  onUpdate,
  index
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity.toString());
  const [showStorePopover, setShowStorePopover] = useState(false);
  const storePopoverRef = useRef<HTMLDivElement>(null);
  const storeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showStorePopover &&
        storePopoverRef.current &&
        !storePopoverRef.current.contains(event.target as Node) &&
        storeButtonRef.current &&
        !storeButtonRef.current.contains(event.target as Node)
      ) {
        setShowStorePopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStorePopover]);

  const handleStoreSelect = async (store: Store | undefined) => {
    setIsUpdating(true);
    try {
      await updateItemInList(listId, item.id, { store });
      onUpdate();
      setShowStorePopover(false);
    } catch (err) {
      console.error('Failed to update store:', err);
    } finally {
      setIsUpdating(false);
      setShowStorePopover(false);
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

  const handleQuantityUpdate = async () => {
    const newQuantity = parseInt(editedQuantity);
    if (isNaN(newQuantity) || newQuantity === item.quantity) {
      setIsEditingQuantity(false);
      setEditedQuantity(item.quantity.toString());
      return;
    }

    setIsUpdating(true);
    try {
      await updateItemInList(listId, item.id, { quantity: newQuantity });
      onUpdate();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setEditedQuantity(item.quantity.toString());
    } finally {
      setIsUpdating(false);
      setIsEditingQuantity(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'name' | 'quantity') => {
    if (e.key === 'Enter') {
      if (type === 'name') {
        handleNameUpdate();
      } else {
        handleQuantityUpdate();
      }
    } else if (e.key === 'Escape') {
      if (type === 'name') {
        setEditedName(item.name);
        setIsEditing(false);
      } else {
        setEditedQuantity(item.quantity.toString());
        setIsEditingQuantity(false);
      }
    }
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group px-2 py-1.5 hover:bg-zinc-50 transition-colors ${
            isUpdating ? 'opacity-50' : ''
          } ${snapshot.isDragging ? 'shadow-lg bg-white rounded-lg ring-1 ring-zinc-200' : ''}`}
        >
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <div {...provided.dragHandleProps} className="touch-none">
                <Bars3Icon className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
              </div>
              <button
                onClick={handleToggleCheck}
                disabled={isUpdating}
                className="relative flex-shrink-0 flex items-center justify-center w-4 h-4 self-center rounded-full border-2 border-zinc-300 hover:border-violet-500 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                <div className={`absolute inset-0.5 rounded-full transition-colors ${item.checked ? 'bg-violet-600' : ''}`} />
                {item.checked && (
                  <svg
                    className="w-2 h-2 text-white relative"
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
                )}
              </button>
            </div>

            <div className="flex-1 min-w-0 py-0.5">
              <div className="flex items-baseline gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleNameUpdate}
                    onKeyDown={(e) => handleKeyDown(e, 'name')}
                    className="flex-1 px-0 border-0 border-b-2 border-violet-500 focus:ring-0 bg-transparent text-zinc-900 text-sm"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => setIsEditing(true)}
                    className={`text-sm font-medium cursor-text transition-colors flex-1 flex items-center ${
                      item.checked 
                        ? 'line-through text-zinc-400' 
                        : item.name 
                          ? 'text-zinc-900 hover:text-violet-600'
                          : 'text-zinc-400 italic hover:text-violet-600'
                    }`}
                  >
                    <span className="truncate">{item.name || 'Add an item'}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {isEditingQuantity ? (
                  <input
                    type="number"
                    value={editedQuantity}
                    onChange={(e) => setEditedQuantity(e.target.value)}
                    onBlur={handleQuantityUpdate}
                    onKeyDown={(e) => handleKeyDown(e, 'quantity')}
                    className="w-12 px-1 py-0.5 border-0 border-b-2 border-violet-500 focus:ring-0 bg-transparent text-xs text-zinc-500 tabular-nums"
                    min="1"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => setIsEditingQuantity(true)}
                    className="text-xs text-zinc-500 tabular-nums whitespace-nowrap cursor-text hover:text-violet-600"
                  >
                    {item.quantity}
                  </span>
                )}
                {item.unit && (
                  <span className="text-xs text-zinc-500">
                    {item.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button
                  ref={storeButtonRef}
                  onClick={() => setShowStorePopover(!showStorePopover)}
                  disabled={isUpdating}
                  className={`p-1 transition-colors ${item.store ? 'text-violet-600' : 'text-zinc-400 hover:text-violet-500'}`}
                  title={item.store ? `Assigned to: ${item.store.name} (click to change)` : "Assign to store"}
                >
                  <BuildingStorefrontIcon className="w-4 h-4" />
                </button>
                
                {showStorePopover && (
                  <div 
                    ref={storePopoverRef}
                    className="absolute right-0 mt-1 z-10 w-48 bg-white shadow-lg rounded-md p-2 border border-zinc-200"
                  >
                    <div className="text-xs font-medium text-zinc-500 mb-1">Select Store:</div>
                    <StoreSelector
                      selectedStore={item.store}
                      onStoreSelect={handleStoreSelect}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              <button
                onClick={handleRemove}
                disabled={isUpdating}
                className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                title="Delete item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      )}
    </Draggable>
  );
}; 