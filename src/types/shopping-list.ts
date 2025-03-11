import { Timestamp } from 'firebase/firestore';

export interface Store {
  id: string;
  name: string;
  order?: number; // For custom store ordering
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  store?: Store; // Store where this item should be purchased
  checked: boolean;
  notes?: string;
  addedAt: Timestamp;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'completed';
}

export type NewShoppingItem = Omit<ShoppingItem, 'id' | 'addedAt'>;
export type UpdateShoppingItem = Partial<Omit<ShoppingItem, 'id'>>; 