import React, { useState, useEffect } from 'react';
import { PantryItem } from '../../types';
import { updatePantryItems, resetPantryItemsToDefault, getUserPreferences } from '../../firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export const PantryManager: React.FC = () => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemVariant, setNewItemVariant] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PantryItem['category']>('basic');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadPantryItems = async () => {
      try {
        setIsLoading(true);
        const preferences = await getUserPreferences();
        if (preferences?.pantryItems) {
          setPantryItems(preferences.pantryItems);
        }
      } catch (error) {
        console.error('Failed to load pantry items:', error);
        toast.error('Failed to load pantry items');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPantryItems();
  }, []);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: PantryItem = {
      id: uuidv4(),
      name: newItemName.trim(),
      variants: [],
      category: newItemCategory
    };
    
    const updatedItems = [...pantryItems, newItem];
    setPantryItems(updatedItems);
    setNewItemName('');
    
    // Save to Firestore
    updatePantryItems(updatedItems)
      .catch(error => {
        console.error('Failed to add pantry item:', error);
        toast.error('Failed to add pantry item');
        // Revert state if save fails
        setPantryItems(pantryItems);
      });
  };

  const handleAddVariant = (itemId: string) => {
    if (!newItemVariant.trim()) return;
    
    const updatedItems = pantryItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          variants: [...item.variants, newItemVariant.trim()]
        };
      }
      return item;
    });
    
    setPantryItems(updatedItems);
    setNewItemVariant('');
    
    // Save to Firestore
    updatePantryItems(updatedItems)
      .catch(error => {
        console.error('Failed to add variant:', error);
        toast.error('Failed to add variant');
        // Revert state if save fails
        setPantryItems(pantryItems);
      });
  };

  const handleRemoveVariant = (itemId: string, variantIndex: number) => {
    const updatedItems = pantryItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          variants: item.variants.filter((_, index) => index !== variantIndex)
        };
      }
      return item;
    });
    
    setPantryItems(updatedItems);
    
    // Save to Firestore
    updatePantryItems(updatedItems)
      .catch(error => {
        console.error('Failed to remove variant:', error);
        toast.error('Failed to remove variant');
        // Revert state if save fails
        setPantryItems(pantryItems);
      });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = pantryItems.filter(item => item.id !== itemId);
    setPantryItems(updatedItems);
    
    // Save to Firestore
    updatePantryItems(updatedItems)
      .catch(error => {
        console.error('Failed to delete pantry item:', error);
        toast.error('Failed to delete pantry item');
        // Revert state if save fails
        setPantryItems(pantryItems);
      });
  };

  const handleEditItemName = (itemId: string, newName: string) => {
    const updatedItems = pantryItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          name: newName.trim()
        };
      }
      return item;
    });
    
    setPantryItems(updatedItems);
    
    // Save to Firestore
    updatePantryItems(updatedItems)
      .catch(error => {
        console.error('Failed to update pantry item:', error);
        toast.error('Failed to update pantry item');
        // Revert state if save fails
        setPantryItems(pantryItems);
      });
  };

  const handleChangeCategory = (itemId: string, newCategory: PantryItem['category']) => {
    const updatedItems = pantryItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          category: newCategory
        };
      }
      return item;
    });
    
    setPantryItems(updatedItems);
    
    // Save to Firestore
    updatePantryItems(updatedItems)
      .catch(error => {
        console.error('Failed to update category:', error);
        toast.error('Failed to update category');
        // Revert state if save fails
        setPantryItems(pantryItems);
      });
  };

  const handleResetToDefaults = async () => {
    try {
      setIsLoading(true);
      await resetPantryItemsToDefault();
      const preferences = await getUserPreferences();
      if (preferences?.pantryItems) {
        setPantryItems(preferences.pantryItems);
      }
      toast.success('Pantry items reset to defaults');
    } catch (error) {
      console.error('Failed to reset pantry items:', error);
      toast.error('Failed to reset pantry items');
    } finally {
      setIsLoading(false);
      setIsResetDialogOpen(false);
    }
  };

  const groupedItems = pantryItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<PantryItem['category'], PantryItem[]>);
  
  const categories = [
    { value: 'basic', label: 'Basic Cooking Essentials' },
    { value: 'dry-goods', label: 'Dry Goods & Baking Staples' },
    { value: 'spices', label: 'Spices & Seasonings' },
    { value: 'other', label: 'Other Items' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-zinc-900">Pantry Items</h2>
        <button
          onClick={() => setIsResetDialogOpen(true)}
          className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-300 rounded-md bg-white hover:bg-zinc-50"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Reset to Defaults
        </button>
      </div>

      <p className="text-sm text-zinc-500 mb-4">
        Pantry items will be excluded from your grocery list when adding recipes.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Add new pantry item */}
          <div className="mb-6 p-4 bg-zinc-50 rounded-lg">
            <h3 className="text-sm font-medium text-zinc-700 mb-3">Add New Pantry Item</h3>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor="newItemName" className="block text-sm text-zinc-600 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  id="newItemName"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-sm"
                  placeholder="Enter item name"
                />
              </div>
              <div className="w-40">
                <label htmlFor="newItemCategory" className="block text-sm text-zinc-600 mb-1">
                  Category
                </label>
                <select
                  id="newItemCategory"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as PantryItem['category'])}
                  className="w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className={`px-4 py-2 rounded-md text-sm flex items-center gap-1 ${
                  !newItemName.trim()
                    ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                <PlusIcon className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>

          {/* Pantry items by category */}
          {categories.map((category) => {
            const items = groupedItems[category.value as PantryItem['category']] || [];
            return (
              <div key={category.value} className="mb-6">
                <h3 className="text-sm font-medium text-zinc-700 mb-2">{category.label}</h3>
                {items.length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">No items in this category</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="border border-zinc-200 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          {editingItemId === item.id ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleEditItemName(item.id, e.target.value)}
                              onBlur={() => setEditingItemId(null)}
                              autoFocus
                              className="flex-1 rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-sm"
                            />
                          ) : (
                            <h4
                              className="text-md font-medium text-zinc-800 cursor-pointer hover:text-violet-600"
                              onClick={() => setEditingItemId(item.id)}
                            >
                              {item.name}
                            </h4>
                          )}
                          <div className="flex items-center gap-2">
                            <select
                              value={item.category}
                              onChange={(e) => handleChangeCategory(item.id, e.target.value as PantryItem['category'])}
                              className="text-xs rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                            >
                              {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Variants */}
                        <div className="ml-4">
                          <h5 className="text-xs font-medium text-zinc-500 mb-1">Variants/Alternate Names:</h5>
                          <ul className="space-y-1 mb-2">
                            {item.variants.length === 0 ? (
                              <li className="text-xs text-zinc-400 italic">No variants</li>
                            ) : (
                              item.variants.map((variant, index) => (
                                <li key={index} className="flex items-center gap-1 text-sm text-zinc-600">
                                  <span>• {variant}</span>
                                  <button
                                    onClick={() => handleRemoveVariant(item.id, index)}
                                    className="text-zinc-400 hover:text-red-500"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </li>
                              ))
                            )}
                          </ul>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newItemVariant}
                              onChange={(e) => setNewItemVariant(e.target.value)}
                              placeholder="Add variant"
                              className="flex-1 rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newItemVariant.trim()) {
                                  e.preventDefault();
                                  handleAddVariant(item.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddVariant(item.id)}
                              disabled={!newItemVariant.trim()}
                              className={`px-2 py-1 rounded-md text-xs ${
                                !newItemVariant.trim()
                                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                  : 'bg-zinc-600 text-white hover:bg-zinc-700'
                              }`}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Reset confirmation dialog */}
      {isResetDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reset to Defaults?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will replace all your pantry items with the default list. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsResetDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 