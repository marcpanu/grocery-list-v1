import { Timestamp } from 'firebase/firestore';

export interface Store {
  /** Unique identifier for the store */
  id: string;
  /** Display name of the store */
  name: string;
  /** Whether the store is currently active */
  isActive: boolean;
  /** Sort order for display */
  order: number;
}

export interface Category {
  /** Unique identifier for the category */
  id: string;
  /** Display name of the category */
  name: string;
  /** Sort order for display */
  order: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category?: Category;
  store?: Store;
  checked: boolean;
  addedAt: Date;
  order: number;
}

export interface ShoppingList {
  /** Unique identifier for the shopping list */
  id: string;
  /** User who owns this list */
  userId: string;
  /** Display name of the list */
  name: string;
  /** List of shopping items */
  items: ShoppingItem[];
  /** Available stores */
  stores: Store[];
  /** Available categories */
  categories: Category[];
  /** Current view mode */
  viewMode: ViewMode;
  /** Whether to show completed items */
  showCompleted: boolean;
  /** Currently selected store filter */
  currentStore: string;
  /** When the list was created */
  createdAt: Timestamp;
  /** When the list was last updated */
  updatedAt: Timestamp;
  /** Current status of the list */
  status: 'active' | 'archived';
}

export type ViewMode = 'combined' | 'sequential';

export type NewShoppingItem = Omit<ShoppingItem, 'id' | 'addedAt'>;
export type UpdateShoppingItem = Partial<Omit<ShoppingItem, 'id' | 'addedAt'>>;

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
  // Shopping list preferences
  shoppingListViewMode: ViewMode;
  shoppingListShowCompleted: boolean;
  shoppingListCurrentStore: string;
  // We can add more preferences here later
  lastUpdated: Timestamp;
}

export interface PantryItem {
  id: string;           // Unique identifier
  name: string;         // Main name of the pantry item
  variants: string[];   // List of variants/alternate names
  category: 'basic' | 'dry-goods' | 'spices' | 'other'; // Category for organization
}

export interface StoredCredential {
  id: string;
  domain: string;
  username: string;
  encryptedPassword: string;  // We'll encrypt passwords before storing
  lastUsed: Timestamp;
}

export interface UserData {
  id: string;
  imageStorage: {
    totalSize: number;  // in bytes
    imageCount: number;
  };
  credentials: StoredCredential[];
}

export * from './recipe';
export * from './mealPlan';
export * from './shoppingList';
export * from './user';
export * from './auth';
export * from './store';
export * from './category';
export * from './pantry'; 