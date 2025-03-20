import { Timestamp } from 'firebase/firestore';
import { PantryItem } from './pantry';
import { StoredCredential } from './auth';

export interface UserPreferences {
  id: string;
  recipeViewMode: 'grid' | 'compact';
  recipeSortBy: 'name' | 'dateAdded' | 'rating';
  recipeSortOrder: 'asc' | 'desc';
  recipeFilters: {
    mealTypes: string[];
    cuisines: string[];
    showFavorites: boolean;
  };
  defaultStore: string | null;  // ID of the default store
  pantryItems: PantryItem[];    // List of pantry items to exclude from grocery list
  // We can add more preferences here later
  lastUpdated: Timestamp;
}

export interface UserData {
  id: string;
  imageStorage: {
    totalSize: number;  // in bytes
    imageCount: number;
  };
  credentials: StoredCredential[];
} 