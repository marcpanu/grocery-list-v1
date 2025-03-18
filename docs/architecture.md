# Architecture Documentation

## Technical Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe development
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components

### State Management
- React Context API for global state
- Local component state where appropriate
- Custom hooks for shared logic

## Core Components

### Recipe Management
```typescript
interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  tags: string[];
}

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
}
```

### Meal Planning
```typescript
interface MealPlan {
  userId: string;
  meals: PlannedMeal[];
  createdAt: Date;
  updatedAt: Date;
}

interface PlannedMeal {
  id: string;
  name: string;
  description?: string;
  type: MealType;
  days: string[];
  servings: number;
  recipeId?: string;
  ingredients?: Ingredient[];
  instructions?: string[];
  cuisine?: string[];
  rating?: number;
  createdAt: Date;
}

interface AddMealData {
  name: string;           // required
  description?: string;   // optional
  type: MealType;        // required
  days: string[];        // required
  servings: number;      // required
  prepTime?: string;     // optional
  cookTime?: string;     // optional
  totalTime?: string;    // optional
  ingredients?: Ingredient[];  // optional for meal plan, required for recipe
  instructions?: string[];    // optional for meal plan, required for recipe
  cuisine?: string[];    // optional
  rating?: number;       // optional
  recipeId?: string;     // optional
}
```

### Shopping List
```typescript
interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  stores: Store[];
  categories: Category[];
  viewMode: ViewMode;
  showCompleted: boolean;
  currentStore: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed';
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  category?: Category;
  store?: Store;
  checked: boolean;
  addedAt: Date;
}

interface Store {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}
```

### Pantry Management
```typescript
interface PantryItem {
  id: string;           // Unique identifier
  name: string;         // Main name of the pantry item
  variants: string[];   // List of variants/alternate names
  category: 'basic' | 'dry-goods' | 'spices' | 'other'; // Category for organization
}
```

## Data Flow

1. **Recipe Selection**
   - User selects recipes
   - Recipes stored in context
   - Triggers meal plan update

2. **Meal Planning**
   - Updates meal plan context
   - Calculates ingredient quantities
   - Triggers shopping list generation

3. **Shopping List Generation**
   - Aggregates ingredients
   - Filters out pantry items
   - Applies store preferences
   - Generates optimized list

## Component Hierarchy

```
App
├── Navigation
├── RecipeSelection
│   ├── RecipeList
│   ├── RecipeCard
│   └── RecipeImport
├── MealPlanner
│   ├── WeeklyCalendar
│   ├── MealSlot
│   └── ServingAdjuster
├── ShoppingList
│   ├── CategoryGroup
│   ├── StoreFilter
│   └── ItemList
└── Settings
    ├── StoreManager
    ├── CategoryManager
    ├── PantryManager
    └── DataManagement
```

## Performance Considerations

- Lazy loading for recipe images
- Memoization of expensive calculations
- Efficient list rendering with virtualization
- Optimistic UI updates
- Local storage caching

## Security

- Input sanitization
- XSS prevention
- CORS configuration
- API rate limiting
- Secure data storage

## Future Scalability

- Microservices architecture
- Database sharding
- CDN integration
- Caching strategies
- API versioning 

## Form Validation

### Recipe Creation
- Required fields:
  - Name
  - Type
  - Prep Time
  - Servings
  - At least one valid ingredient
  - At least one valid instruction

### Meal Planning
- Required fields when adding to meal plan:
  - Name
  - Type
  - Servings
  - At least one day selected

### Shopping List
- Required fields for items:
  - Name
  - Quantity

## State Management

### Shopping List Filters
- Store selection persistence
- Filter state in URL
- Clear UI feedback for active filters
- Proper handling of "All Stores" view 