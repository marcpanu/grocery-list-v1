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
  description: string | null;
  prepTime: number | null;  // Now optional
  cookTime: number | null;  // Now optional
  totalTime: number | null;
  displayTotalTime: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  imageUrl: string | null;
  notes: string | null;
  mealTypes: string[] | null;  // Optional
  cuisine: string[] | null;
  rating: number | null;
  dateAdded: Date;
  isFavorite: boolean;
  source: {
    type: 'url' | 'instagram' | 'tiktok';
    url: string;
    title: string | null;
  } | null;
}

interface Ingredient {
  name: string;
  quantity: number | string;
  unit: string | null;
  notes: string | null;
}

interface Instruction {
  order: number;
  instruction: string;
}
```

### Meal Planning
```typescript
// Define meal types in meal planning
export type MealPlanMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

interface MealPlan {
  id: string;
  userId: string;
  meals: Meal[];
  createdAt: Date;
  updatedAt: Date;
}

interface Meal {
  id: string;
  name: string;
  description?: string;
  mealPlanMeal: MealPlanMealType;  // Changed from 'type: MealType' to separate concerns
  days: string[];
  servings: number;
  recipeId?: string;
  createdAt: Date;
}

interface AddMealData {
  name: string;           // required
  description?: string;   // optional
  mealTypes: string[];    // optional
  servings: number;       // required
  prepTime?: string;      // optional
  cookTime?: string;      // optional
  totalTime?: string;     // optional
  ingredients?: Ingredient[];  // required - at least one
  instructions?: string[];    // required - at least one
  cuisine?: string[];     // optional
  rating?: number;        // optional
  recipeId?: string;      // optional
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

## Ingredient Processing

### Quantity Standardization
```typescript
interface IngredientConversion {
  name: string;                 // Standardized name for shopping
  density: number;              // Grams per cup
  countEquivalent?: number;     // Grams per whole item (if applicable)
  defaultUnit: string;          // Standard unit for shopping
  variants: string[];           // Alternative names to match
  category: string;             // Category for organization
}
```

The quantity standardization system converts recipe measurements to shopping-friendly units using a three-step process:

1. **Volume Standardization**: Converts various volume measurements (tsp, tbsp, cups) to a standard unit (cups)
2. **Weight Conversion**: Converts volume measurements to weight using density values (cups → grams)
3. **Count Conversion**: For countable items (produce, etc.), converts weight to count using per-item weights

This allows the app to:
- Convert "1/2 cup chopped bell pepper" → "1 bell pepper"
- Convert "2 tbsp minced garlic" → "6 garlic cloves"
- Convert "3 cups flour" → "360g flour"

### Automatic Categorization

The categorization system uses pattern matching to assign appropriate categories to grocery items:

1. **Category Matching**: Ingredients are matched against common keywords for each category
2. **Fallback Processing**: If no direct match, tries partial and substring matching
3. **Default Category**: Uses an "Other" category as fallback when no match is found

This enables automatic organization of shopping lists without requiring manual categorization by users.

### Shopping List Generation Process

The complete ingredient processing flow:

1. Recipe ingredients are extracted from selected recipes
2. Quantities are adjusted based on serving sizes
3. Duplicate ingredients are identified and combined
4. Pantry items are filtered out
5. Ingredients are standardized to shopping-friendly quantities
6. Automatic categorization is applied
7. Default store assignments are applied based on user preferences
8. Final shopping items are added to the list

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
  - Servings
  - At least one valid ingredient
  - At least one valid instruction
- Optional fields:
  - Description
  - Prep Time
  - Cook Time
  - Meal Types
  - Cuisine
  - Rating
  - Notes

### Meal Planning (via ScheduleMealModal)
- Required fields when scheduling a meal:
  - Recipe (must be selected first)
  - Meal of the Day
  - At least one day selected
- Optional fields:
  - Servings override (defaults to recipe servings)

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