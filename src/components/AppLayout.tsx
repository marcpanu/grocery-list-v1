import { useState } from 'react';
import { ShoppingList } from './ShoppingList';
import { StoreManager } from './StoreManager';
import { CategoryManager } from './CategoryManager';

type Tab = 'recipes' | 'plan' | 'list' | 'settings';

export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('list');

  const renderContent = () => {
    switch (activeTab) {
      case 'recipes':
        return (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Under construction
          </div>
        );
      case 'plan':
        return (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Under construction
          </div>
        );
      case 'list':
        return <ShoppingList />;
      case 'settings':
        return (
          <div className="space-y-8 p-4">
            <StoreManager />
            <CategoryManager />
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-zinc-200 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-around">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex flex-col items-center px-4 py-2 text-xs font-medium ${
                activeTab === 'recipes' ? 'text-violet-600' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Recipes
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex flex-col items-center px-4 py-2 text-xs font-medium ${
                activeTab === 'plan' ? 'text-violet-600' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Plan
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex flex-col items-center px-4 py-2 text-xs font-medium ${
                activeTab === 'list' ? 'text-violet-600' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              List
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center px-4 py-2 text-xs font-medium ${
                activeTab === 'settings' ? 'text-violet-600' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}; 