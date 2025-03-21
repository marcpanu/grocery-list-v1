import React, { useState, useRef, useEffect } from 'react';
import { ShoppingList } from './ShoppingList';
import { PageHeader } from './PageHeader';
import { Settings } from './Settings';
import { RecipeList, RecipeListRefType } from './recipes/RecipeList';
import { RecipeDetail } from './recipes/RecipeDetail';
import { addTestRecipes } from '../scripts/addTestRecipes';
import { ViewMode, Store } from '../types';
import { getUserShoppingLists, getUserPreferences, updateUserPreferences, migrateShoppingListSettings } from '../firebase/firestore';
import { 
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { StoreSelector } from './StoreSelector';
import MealPlanPage, { MealPlanRefType } from '../pages/MealPlanPage';

// Expose addTestRecipes to window for development
if (process.env.NODE_ENV === 'development') {
  (window as any).addTestRecipes = addTestRecipes;
}

// Since this is a single-user app, we'll use a constant ID
const USER_ID = 'default-user';

// Local storage key for active tab
const ACTIVE_TAB_STORAGE_KEY = 'shopping-list-active-tab';

type Tab = 'recipes' | 'plan' | 'list' | 'settings';

export const AppLayout: React.FC = () => {
  // Initialize with saved tab from localStorage, or fall back to 'list'
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const savedTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    return (savedTab as Tab) || 'list';
  });
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const storeFilterRef = useRef<HTMLDivElement>(null);
  const [listId, setListId] = useState<string | null>(null);

  // Shopping list view state
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [showCompleted, setShowCompleted] = useState(true);
  const [currentStore, setCurrentStore] = useState<string>('all');
  const [selectedStoreObj, setSelectedStoreObj] = useState<Store | undefined>();
  const [showStoreFilter, setShowStoreFilter] = useState(false);

  // Reference to MealPlanPage component to reset detail views
  const mealPlanRef = useRef<MealPlanRefType>(null);
  // Reference to RecipeList component to reset detail views
  const recipeListRef = useRef<RecipeListRefType>(null);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  // Load view settings from UserPreferences
  useEffect(() => {
    const loadViewSettings = async () => {
      try {
        // Migrate any existing settings from shopping list to user preferences
        await migrateShoppingListSettings();
        
        // Load user preferences for view settings
        const userPrefs = await getUserPreferences();
        if (userPrefs) {
          setViewMode(userPrefs.shoppingListViewMode);
          setShowCompleted(userPrefs.shoppingListShowCompleted);
          setCurrentStore(userPrefs.shoppingListCurrentStore);
          
          // Get shopping list to find store object
          const userLists = await getUserShoppingLists(USER_ID);
          if (userLists.length > 0) {
            const list = userLists[0];
            setListId(list.id);
            
            // Set selected store object based on current store
            if (list.stores && userPrefs.shoppingListCurrentStore !== 'all') {
              setSelectedStoreObj(list.stores.find(s => s.id === userPrefs.shoppingListCurrentStore));
            } else {
              setSelectedStoreObj(undefined);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load view settings:', err);
      }
    };

    loadViewSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeFilterRef.current && !storeFilterRef.current.contains(event.target as Node)) {
        setShowStoreFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update UserPreferences when view settings change
  const handleViewModeChange = async (newMode: ViewMode) => {
    setViewMode(newMode);
    try {
      await updateUserPreferences({ shoppingListViewMode: newMode });
    } catch (err) {
      console.error('Failed to update view mode:', err);
    }
  };

  const handleShowCompletedChange = async (show: boolean) => {
    setShowCompleted(show);
    try {
      await updateUserPreferences({ shoppingListShowCompleted: show });
    } catch (err) {
      console.error('Failed to update show completed setting:', err);
    }
  };

  const handleStoreChange = async (storeId: string) => {
    setCurrentStore(storeId);
    try {
      await updateUserPreferences({ shoppingListCurrentStore: storeId });
      
      // Update selected store object
      if (storeId === 'all') {
        setSelectedStoreObj(undefined);
      } else {
        const userLists = await getUserShoppingLists(USER_ID);
        const list = userLists[0];
        if (list?.stores) {
          setSelectedStoreObj(list.stores.find(s => s.id === storeId));
        }
      }
    } catch (err) {
      console.error('Failed to update current store:', err);
    }
  };

  const handleRecipeSelect = (id: string) => {
    setSelectedRecipeId(id);
  };

  const handleRecipeBack = () => {
    setSelectedRecipeId(null);
  };

  const handleRecipeEdit = (id: string) => {
    // TODO: Implement recipe editing
    console.log('Edit recipe:', id);
  };

  // Handle tab navigation with reset of detail views
  const handleTabClick = (tab: Tab) => {
    if (tab === activeTab) {
      // If clicking the already active tab, reset detail views
      setSelectedRecipeId(null);
      
      // Reset meal plan detail views if on meal plan tab
      if (tab === 'plan' && mealPlanRef.current) {
        mealPlanRef.current.resetDetailViews();
      }
      
      // Reset recipe list detail views if on recipes tab
      if (tab === 'recipes' && recipeListRef.current) {
        recipeListRef.current.resetDetailViews();
      }
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'recipes':
        return selectedRecipeId ? (
          <RecipeDetail
            recipeId={selectedRecipeId}
            onBack={handleRecipeBack}
            onEdit={handleRecipeEdit}
          />
        ) : (
          <RecipeList ref={recipeListRef} onRecipeSelect={handleRecipeSelect} />
        );
      case 'plan':
        return <MealPlanPage ref={mealPlanRef} />;
      case 'list':
        return (
          <>
            <PageHeader 
              title="Grocery List" 
              actions={
                <div className="flex items-center space-x-2">
                  <div className="relative" ref={storeFilterRef}>
                    <button
                      onClick={() => setShowStoreFilter(!showStoreFilter)}
                      className={`p-1.5 rounded-md transition-colors duration-200 ${
                        showStoreFilter || currentStore !== 'all'
                          ? 'text-violet-600 bg-violet-50'
                          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      <FunnelIcon className="w-5 h-5" />
                    </button>
                    
                    {showStoreFilter && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-zinc-200 p-4 z-50">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">
                            Store Filter
                          </label>
                          <StoreSelector
                            selectedStore={selectedStoreObj}
                            onStoreSelect={(store) => {
                              handleStoreChange(store?.id || 'all');
                              setShowStoreFilter(false);
                            }}
                            allowAllStores
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center bg-zinc-100 rounded-lg p-1">
                    <button
                      onClick={() => handleViewModeChange('combined')}
                      className={`p-1.5 rounded-md transition-colors duration-200 ${
                        viewMode === 'combined'
                          ? 'bg-white shadow text-violet-600'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewModeChange('sequential')}
                      className={`p-1.5 rounded-md transition-colors duration-200 ${
                        viewMode === 'sequential'
                          ? 'bg-white shadow text-violet-600'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleShowCompletedChange(!showCompleted)}
                    className={`p-1.5 rounded-md transition-colors duration-200 ${
                      showCompleted
                        ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-violet-600 bg-violet-50'
                    }`}
                    title={showCompleted ? 'Hide completed items' : 'Show completed items'}
                  >
                    {showCompleted ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeSlashIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              }
            />
            <ShoppingList 
              viewMode={viewMode}
              showCompleted={showCompleted}
              currentStore={currentStore}
            />
          </>
        );
      case 'settings':
        return (
          <>
            <PageHeader title="Settings" />
            <Settings />
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 border-t border-zinc-200 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-around">
            <button
              onClick={() => handleTabClick('recipes')}
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
              onClick={() => handleTabClick('plan')}
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
              onClick={() => handleTabClick('list')}
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
              onClick={() => handleTabClick('settings')}
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