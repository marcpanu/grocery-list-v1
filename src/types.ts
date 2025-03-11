import { Timestamp } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Store {
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
  addedAt: Timestamp;
}

export interface NewShoppingItem {
  name: string;
  quantity: number;
  unit?: string;
  category?: Category;
  store?: Store;
  checked: boolean;
}

export interface UpdateShoppingItem {
  name?: string;
  quantity?: number;
  unit?: string;
  category?: Category;
  store?: Store;
  checked?: boolean;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'archived';
  viewMode: ViewMode;
  showCompleted: boolean;
  currentStore?: string;
}

export type ViewMode = 'combined' | 'sequential'; 