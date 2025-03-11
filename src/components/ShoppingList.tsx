import React, { useState, useEffect } from 'react';
import { ShoppingListItem } from './ShoppingListItem';
import { StoreManager } from './StoreManager';
import { createShoppingList, getShoppingList, addItemToList, getUserShoppingLists } from '../firebase/firestore';
import { ShoppingList as ShoppingListType, NewShoppingItem } from '../types/shopping-list';

// TODO: Replace with actual user ID from authentication
const TEST_USER_ID = 'testUser';

export const ShoppingList: React.FC = () => {
  const [list, setList] = useState<ShoppingListType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');

  useEffect(() => {
    const initializeList = async () => {
      try {
        // Get user's active shopping lists
        const userLists = await getUserShoppingLists(TEST_USER_ID);
        
        // Use the most recent active list or create a new one
        let activeList: ShoppingListType;
        if (userLists.length > 0) {
          activeList = userLists[0];
        } else {
          activeList = await createShoppingList(TEST_USER_ID, 'Shopping List');
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!list?.id || !newItemName.trim()) return;

    try {
      const newItem: NewShoppingItem = {
        name: newItemName.trim(),
        quantity: Number(newItemQuantity),
        unit: newItemUnit.trim(),
        category: '', // Add category selection later
        checked: false
      };

      await addItemToList(list.id, newItem);
      setNewItemName('');
      setNewItemQuantity('1');
      setNewItemUnit('');
      refreshList();
    } catch (err) {
      setError('Failed to add item');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!list) return <div>No list found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Store Management */}
        <div className="md:col-span-1">
          <StoreManager />
        </div>

        {/* Shopping List */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-4">{list.name}</h1>

          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="mb-6">
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
              <button
                type="submit"
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              >
                Add
              </button>
            </div>
          </form>

          {/* Items List */}
          <div className="border rounded-lg divide-y">
            {list.items.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={item}
                listId={list.id}
                onUpdate={refreshList}
              />
            ))}
            {list.items.length === 0 && (
              <div className="p-4 text-gray-500 text-center">
                No items in the list
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 