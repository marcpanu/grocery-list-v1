import { Timestamp } from 'firebase/firestore';

export interface Store {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  stores: Store[];
  categories: Category[];
  viewMode: ViewMode;
  showCompleted: boolean;
  currentStore: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ViewMode = 'combined' | 'sequential';

export type NewShoppingItem = Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateShoppingItem = Partial<Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>>; 