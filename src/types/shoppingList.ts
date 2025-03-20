import { Timestamp } from 'firebase/firestore';
import { Category } from './category';
import { Store } from './store';

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