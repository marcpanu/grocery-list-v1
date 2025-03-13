import { CategorySelector } from './CategorySelector';
import { StoreSelector } from './StoreSelector';
import { Category, Store, NewShoppingItem } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: NewShoppingItem) => Promise<void>;
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemQuantity: string;
  setNewItemQuantity: (quantity: string) => void;
  newItemUnit: string;
  setNewItemUnit: (unit: string) => void;
  selectedCategory: Category | undefined;
  setSelectedCategory: (category: Category | undefined) => void;
  selectedStore: Store | undefined;
  setSelectedStore: (store: Store | undefined) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newItemName,
  setNewItemName,
  newItemQuantity,
  setNewItemQuantity,
  newItemUnit,
  setNewItemUnit,
  selectedCategory,
  setSelectedCategory,
  selectedStore,
  setSelectedStore,
}) => {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: NewShoppingItem = {
      name: newItemName.trim(),
      quantity: Number(newItemQuantity),
      unit: newItemUnit.trim() || undefined,
      category: selectedCategory,
      store: selectedStore,
      checked: false
    };

    await onSubmit(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-zinc-200">
            <h3 className="text-lg font-medium text-zinc-900">Add Item</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Add an item"
                  className="flex-1 rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-sm"
                  autoFocus
                />
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  min="1"
                  placeholder="Qty"
                  className="w-16 rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-xs"
                />
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="Unit"
                  className="w-20 rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-xs"
                />
              </div>
              <div className="space-y-2">
                <CategorySelector
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  className="w-full"
                />
                <StoreSelector
                  selectedStore={selectedStore}
                  onStoreSelect={setSelectedStore}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 