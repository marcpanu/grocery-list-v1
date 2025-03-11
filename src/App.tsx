import React from 'react';
import { ShoppingList } from './components/ShoppingList';
import { StoreManager } from './components/StoreManager';
import { CategoryManager } from './components/CategoryManager';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping List App</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Settings Panel */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white shadow rounded-lg">
              <StoreManager />
            </div>
            <div className="bg-white shadow rounded-lg">
              <CategoryManager />
            </div>
          </div>

          {/* Shopping List */}
          <div className="md:col-span-8">
            <div className="bg-white shadow rounded-lg">
              <ShoppingList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 