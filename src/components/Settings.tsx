import { useState } from 'react';
import { StoreManager } from './StoreManager';
import { CategoryManager } from './CategoryManager';
import { SettingsMenuItem } from './SettingsMenuItem';

export const Settings = () => {
  const [activeSection, setActiveSection] = useState<'main' | 'stores' | 'categories'>('main');

  if (activeSection === 'stores') {
    return (
      <div className="h-full bg-zinc-100">
        <button
          onClick={() => setActiveSection('main')}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </button>
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm">
            <StoreManager />
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'categories') {
    return (
      <div className="h-full bg-zinc-100">
        <button
          onClick={() => setActiveSection('main')}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Settings
        </button>
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm">
            <CategoryManager />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-100">
      <div className="p-4 space-y-4">
        {/* List Management Section */}
        <div>
          <h2 className="px-4 text-base font-bold text-zinc-900 mb-2">List Management</h2>
          <div className="bg-white rounded-lg shadow-sm divide-y divide-zinc-200">
            <SettingsMenuItem
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              title="Manage Stores"
              description="Add, edit, and organize your shopping locations"
              onClick={() => setActiveSection('stores')}
            />

            <SettingsMenuItem
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              }
              title="Manage Categories"
              description="Customize item categories and their order"
              onClick={() => setActiveSection('categories')}
            />
          </div>
        </div>

        {/* About Section */}
        <div>
          <h2 className="px-4 text-base font-bold text-zinc-900 mb-2">About</h2>
          <div className="bg-white rounded-lg shadow-sm">
            <SettingsMenuItem
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Version"
              description="0.1.0"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 