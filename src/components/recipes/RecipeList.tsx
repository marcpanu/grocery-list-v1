import { useState, useEffect, useRef } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Recipe, RecipePreview } from '../../types/recipe';
import { RecipeCard } from './RecipeCard';
import { 
  getAllRecipes, 
  toggleRecipeFavorite,
  getUserPreferences,
  updateUserPreferences,
  deleteRecipe,
  addRecipe
} from '../../firebase/firestore';
import { UserPreferences } from '../../types';
import { RecipeImportModal } from './RecipeImportModal';
import { RecipeUrlImport } from './RecipeUrlImport';
import ConfirmDialog from '../common/ConfirmDialog';
import { useRecipeImport } from '../../hooks/useRecipeImport';
import { AddMealModal } from '../mealPlan/AddMealModal';
import { AddMealData } from '../mealPlan/AddMealModal';

interface RecipeListProps {
  onRecipeSelect: (id: string) => void;
}

type ViewMode = 'grid' | 'compact';
type SortBy = UserPreferences['recipeSortBy'];
type SortOrder = UserPreferences['recipeSortOrder'];

export const RecipeList = ({ onRecipeSelect }: RecipeListProps) => {
  const [recipes, setRecipes] = useState<RecipePreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('dateAdded');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  // Refs for click outside handling
  const sortButtonRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);

  // Get unique meal types and cuisines from recipes
  const availableMealTypes = [...new Set(recipes.flatMap(r => r.mealTypes || []))].sort();
  const availableCuisines = [...new Set(recipes.map(r => r.cuisine).filter((c): c is string => !!c))].sort();

  // Use the recipe import hook
  const {
    showImportModal,
    setShowImportModal,
    showUrlImportModal,
    handleImportOptionSelect,
    handleUrlImport,
    closeUrlImport
  } = useRecipeImport((recipe) => {
    if (recipe) {
      // Handle imported recipe
      setRecipes(prevRecipes => [{
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl,
        prepTime: recipe.prepTime,
        mealTypes: recipe.mealTypes,
        cuisine: recipe.cuisine?.[0] || null,
        rating: recipe.rating,
        dateAdded: recipe.dateAdded,
        isFavorite: recipe.isFavorite
      }, ...prevRecipes]);
    } else {
      // Handle manual entry
      setShowAddMealModal(true);
    }
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [fetchedRecipes, userPrefs] = await Promise.all([
          getAllRecipes(),
          getUserPreferences()
        ]);
        
        setRecipes(fetchedRecipes);
        if (userPrefs) {
          setViewMode(userPrefs.recipeViewMode);
          setSortBy(userPrefs.recipeSortBy);
          setSortOrder(userPrefs.recipeSortOrder);
          setSelectedMealTypes(userPrefs.recipeFilters.mealTypes);
          setSelectedCuisines(userPrefs.recipeFilters.cuisines);
          setShowFavorites(userPrefs.recipeFilters.showFavorites);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortButtonRef.current && !sortButtonRef.current.contains(event.target as Node)) {
        setShowSortOptions(false);
      }
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewModeChange = async (newMode: ViewMode) => {
    setViewMode(newMode);
    try {
      await updateUserPreferences({ recipeViewMode: newMode });
    } catch (error) {
      console.error('Error updating view mode preference:', error);
      setViewMode(viewMode);
    }
  };

  const handleSortChange = async (newSortBy: SortBy) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    try {
      await updateUserPreferences({ 
        recipeSortBy: newSortBy,
        recipeSortOrder: newSortOrder
      });
    } catch (error) {
      console.error('Error updating sort preferences:', error);
      setSortBy(sortBy);
      setSortOrder(sortOrder);
    }
  };

  const handleFilterChange = async (type: 'mealTypes' | 'cuisines' | 'favorites', value: string | boolean) => {
    if (type === 'favorites') {
      setShowFavorites(value as boolean);
      try {
        await updateUserPreferences({
          recipeFilters: {
            mealTypes: selectedMealTypes,
            cuisines: selectedCuisines,
            showFavorites: value as boolean
          }
        });
      } catch (error) {
        console.error('Error updating favorites filter:', error);
        setShowFavorites(!value);
      }
      return;
    }

    const currentSelection = type === 'mealTypes' ? selectedMealTypes : selectedCuisines;
    const newSelection = currentSelection.includes(value as string)
      ? currentSelection.filter(item => item !== value)
      : [...currentSelection, value as string];

    if (type === 'mealTypes') {
      setSelectedMealTypes(newSelection);
    } else {
      setSelectedCuisines(newSelection);
    }

    try {
      await updateUserPreferences({
        recipeFilters: {
          mealTypes: type === 'mealTypes' ? newSelection : selectedMealTypes,
          cuisines: type === 'cuisines' ? newSelection : selectedCuisines,
          showFavorites
        }
      });
    } catch (error) {
      console.error('Error updating filter preferences:', error);
      if (type === 'mealTypes') {
        setSelectedMealTypes(selectedMealTypes);
      } else {
        setSelectedCuisines(selectedCuisines);
      }
    }
  };

  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    try {
      await toggleRecipeFavorite(id, isFavorite);
      setRecipes(recipes.map(recipe => 
        recipe.id === id ? { ...recipe, isFavorite } : recipe
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    setRecipeToDelete(id);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    try {
      await deleteRecipe(recipeToDelete);
      setRecipes(recipes.filter(recipe => recipe.id !== recipeToDelete));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    } finally {
      setRecipeToDelete(null);
    }
  };

  const handleAddRecipe = async (recipeData: Recipe | AddMealData) => {
    try {
      setIsLoading(true);
      const newRecipe = await addRecipe({
        ...recipeData,
        dateAdded: new Date(),
        isFavorite: false
      } as Recipe);
      
      setRecipes(prevRecipes => [{
        id: newRecipe.id,
        name: newRecipe.name,
        imageUrl: newRecipe.imageUrl,
        prepTime: newRecipe.prepTime,
        mealTypes: newRecipe.mealTypes,
        cuisine: newRecipe.cuisine?.[0] || null,
        rating: newRecipe.rating,
        dateAdded: newRecipe.dateAdded,
        isFavorite: newRecipe.isFavorite
      }, ...prevRecipes]);
      
      setShowAddMealModal(false);
    } catch (error) {
      console.error('Failed to add recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedRecipes = recipes
    .filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMealType = selectedMealTypes.length === 0 || 
        recipe.mealTypes?.some(type => selectedMealTypes.includes(type));
      const matchesCuisine = selectedCuisines.length === 0 || 
        selectedCuisines.includes(recipe.cuisine || '');
      const matchesFavorites = !showFavorites || recipe.isFavorite;
      return matchesSearch && matchesMealType && matchesCuisine && matchesFavorites;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case 'dateAdded':
          comparison = b.dateAdded.getTime() - a.dateAdded.getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900">Recipes</h1>
            
            <div className="flex items-center space-x-2">
              {/* Sort Button */}
              <div ref={sortButtonRef} className="relative">
                <button
                  onClick={() => {
                    setShowSortOptions(!showSortOptions);
                    setShowFilters(false);
                  }}
                  className="p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                >
                  <ArrowsUpDownIcon className="w-5 h-5" />
                </button>
                
                {showSortOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-50">
                    {(['name', 'dateAdded', 'rating'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          handleSortChange(option);
                          setShowSortOptions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center justify-between"
                      >
                        <span className={sortBy === option ? 'text-violet-600' : 'text-zinc-700'}>
                          Sort by {option === 'dateAdded' ? 'date' : option}
                        </span>
                        {sortBy === option && (
                          sortOrder === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter Button */}
              <div ref={filterButtonRef} className="relative">
                <button
                  onClick={() => {
                    setShowFilters(!showFilters);
                    setShowSortOptions(false);
                  }}
                  className={`p-1.5 rounded-md transition-colors duration-200 ${
                    showFilters || selectedMealTypes.length > 0 || selectedCuisines.length > 0 || showFavorites
                      ? 'text-violet-600 bg-violet-50'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
                
                {showFilters && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-zinc-200 p-4 z-50">
                    <div className="space-y-4">
                      {/* Clear Filters Button */}
                      {(selectedMealTypes.length > 0 || selectedCuisines.length > 0 || showFavorites) && (
                        <button
                          onClick={() => {
                            setSelectedMealTypes([]);
                            setSelectedCuisines([]);
                            setShowFavorites(false);
                            updateUserPreferences({
                              recipeFilters: {
                                mealTypes: [],
                                cuisines: [],
                                showFavorites: false
                              }
                            });
                          }}
                          className="w-full px-3 py-1.5 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors duration-200"
                        >
                          Clear all filters
                        </button>
                      )}

                      {/* Favorites Filter */}
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={showFavorites}
                            onChange={(e) => handleFilterChange('favorites', e.target.checked)}
                            className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="ml-2 text-sm text-zinc-700">Show favorites only</span>
                        </label>
                      </div>

                      {/* Meal Types */}
                      <div>
                        <h3 className="font-medium text-sm text-zinc-900 mb-2">Meal Types</h3>
                        <div className="space-y-2">
                          {availableMealTypes.map(type => (
                            <label key={type} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedMealTypes.includes(type)}
                                onChange={() => handleFilterChange('mealTypes', type)}
                                className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                              />
                              <span className="ml-2 text-sm text-zinc-700">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Cuisines */}
                      <div>
                        <h3 className="font-medium text-sm text-zinc-900 mb-2">Cuisines</h3>
                        <div className="space-y-2">
                          {availableCuisines.map(cuisine => (
                            <label key={cuisine} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedCuisines.includes(cuisine)}
                                onChange={() => handleFilterChange('cuisines', cuisine)}
                                className="rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                              />
                              <span className="ml-2 text-sm text-zinc-700">{cuisine}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-zinc-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-1.5 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow text-violet-600'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleViewModeChange('compact')}
                  className={`p-1.5 rounded-md transition-colors duration-200 ${
                    viewMode === 'compact'
                      ? 'bg-white shadow text-violet-600'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Active Filters */}
          {(selectedMealTypes.length > 0 || selectedCuisines.length > 0 || showFavorites) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {showFavorites && (
                <button
                  onClick={() => handleFilterChange('favorites', false)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-violet-100 text-violet-700 hover:bg-violet-200"
                >
                  Favorites only
                  <XMarkIcon className="w-4 h-4 ml-1" />
                </button>
              )}
              {selectedMealTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('mealTypes', type)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-violet-100 text-violet-700 hover:bg-violet-200"
                >
                  {type}
                  <XMarkIcon className="w-4 h-4 ml-1" />
                </button>
              ))}
              {selectedCuisines.map(cuisine => (
                <button
                  key={cuisine}
                  onClick={() => handleFilterChange('cuisines', cuisine)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-violet-100 text-violet-700 hover:bg-violet-200"
                >
                  {cuisine}
                  <XMarkIcon className="w-4 h-4 ml-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : filteredAndSortedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600">No recipes found matching your criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavoriteToggle={handleFavoriteToggle}
                onDelete={handleDeleteRecipe}
                onClick={onRecipeSelect}
                view={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredAndSortedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onFavoriteToggle={handleFavoriteToggle}
                onDelete={handleDeleteRecipe}
                onClick={onRecipeSelect}
                view={viewMode}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowImportModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Import Modals */}
      <RecipeImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSelectOption={handleImportOptionSelect}
      />

      <RecipeUrlImport
        isOpen={showUrlImportModal}
        onClose={closeUrlImport}
        onImport={handleUrlImport}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Add Recipe Modal */}
      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onAdd={handleAddRecipe}
        isLoading={isLoading}
        isAddingToMealPlan={false}
      />
    </div>
  );
}; 