export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Store {
  id: string;
  name: string;
  isActive: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  completed: boolean;
  currentStore: string;
  preferredStores: string[];
  metadata?: {
    quantity?: string;
    notes?: string;
    customOrder?: number;
  };
}

export const CATEGORIES: Category[] = [
  { id: 'produce', name: 'Produce', sortOrder: 1 },
  { id: 'meat-seafood', name: 'Meat & Seafood', sortOrder: 2 },
  { id: 'dairy', name: 'Dairy', sortOrder: 3 },
  { id: 'frozen', name: 'Frozen', sortOrder: 4 },
  { id: 'pantry', name: 'Pantry', sortOrder: 5 },
];

export const STORES: Store[] = [
  { id: 'all', name: 'All Stores', isActive: true },
  { id: 'farmers-market', name: 'Farmers Market', isActive: true },
  { id: 'publix', name: 'Publix', isActive: true },
  { id: 'whole-foods', name: 'Whole Foods', isActive: true },
];

export type ViewMode = 'combined' | 'sequential'; 