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