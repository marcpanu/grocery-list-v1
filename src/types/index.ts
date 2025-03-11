import { Timestamp } from 'firebase/firestore';

export interface Store {
  id: string;
  name: string;
  order: number;
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
  addedAt: Timestamp;
}

export type NewShoppingItem = Omit<ShoppingItem, 'id' | 'addedAt'>;
export type UpdateShoppingItem = Partial<Omit<ShoppingItem, 'id' | 'addedAt'>>;

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'archived';
} 