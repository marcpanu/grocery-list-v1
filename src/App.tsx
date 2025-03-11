import React, { useState } from 'react';
import { ShoppingList } from './components/ShoppingList';
import { StoreManager } from './components/StoreManager';
import { CategoryManager } from './components/CategoryManager';

type Tab = 'list' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('list');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Shopping List</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'list'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'settings'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'list' ? (
          <div className="bg-white rounded-lg shadow">
            <ShoppingList />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Store Management</h2>
                <StoreManager />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Category Management</h2>
                <CategoryManager />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App; 