export interface PantryItem {
  id: string;           // Unique identifier
  name: string;         // Main name of the pantry item
  variants: string[];   // List of variants/alternate names
  category: 'basic' | 'dry-goods' | 'spices' | 'other'; // Category for organization
} 