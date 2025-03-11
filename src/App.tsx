import * as React from 'react';
import { GroceryProvider } from './context/GroceryContext';
import { ItemInput } from './components/ItemInput';
import { GroceryList } from './components/GroceryList';

export default function App() {
  return (
    <GroceryProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping List</h1>
          <ItemInput />
          <GroceryList />
        </div>
      </div>
    </GroceryProvider>
  );
} 