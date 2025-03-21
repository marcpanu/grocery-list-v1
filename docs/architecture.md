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
  weeks: Week[];          // New structure for multi-week support
  currentWeekId: string;  // Reference to the current active week
  createdAt: Date;
  updatedAt: Date;
}

interface Week {
  id: string;
  userId: string;         // Owner of the week
  startDate: string;      // ISO date string for week start (YYYY-MM-DD)
  endDate: string;        // ISO date string for week end (YYYY-MM-DD)
  label: string;          // Display label for the week
  createdAt: Date;
  updatedAt: Date;
}

interface Meal {
  id: string;
  userId: string;         // Owner of the meal
  weekId: string;         // Reference to parent week
  name: string;
  description?: string;
  mealPlanMeal: MealPlanMealType;
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
  weekId: string;         // required - the week to add the meal to
}

interface ScheduleMealData {
  name: string;
  mealPlanMeal: MealPlanMealType;
  days: string[];
  servings: number;
  recipeId: string;
  weekId: string;         // The week to schedule the meal in
}
```

### Multi-Week Meal Planning Implementation

The multi-week meal planning system implements these key features:

#### Week Management
- **Week Creation**: Weeks are created via `createOrGetWeek` function that:
  - Calculates proper Sunday-Saturday week dates for any given date
  - Checks if a week already exists for that date range
  - Creates a new week if it doesn't exist
  - Returns the week object with ID
  - Updates the meal plan document to include the week

- **Week Storage**: 
  - Weeks are stored in a dedicated `weeks` collection
  - The `MealPlan` document stores references to weeks and tracks the current active week
  - The `Meal` objects are associated with specific weeks via the `weekId` field

#### Timeline Navigation
- The timeline interface displays weeks in chronological order
- Visual indicators show:
  - Past weeks: Gray background with dark gray indicator
  - Current week: Purple background and indicator
  - Future weeks: White background with green indicator
  - Week date range labels (e.g., "3/16-3/22")

#### Date Handling
- ISO date strings (YYYY-MM-DD) are used for storage to avoid timezone issues
- When displaying dates, special handling converts ISO strings to local dates
- Custom `getWeekDates` function calculates Sunday-Saturday date ranges
- Week creation automatically handles full-week boundaries

#### User Interface Components
- **WeekTimeline**: Horizontal scrollable container of week chips
- **WeekChip**: Individual selectable element for each week
- **CurrentWeekIndicator**: Text display of active week dates
- **Today Button**: Navigation control to jump to the current week
- **Add Week Button**: Control to create a new week
- **AddWeekModal**: Calendar-based interface for selecting a date for a new week

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
   - Week selection and navigation
   - Meals organized by week and day
   - Week data persistence and retrieval
   - Calculation of current week
   - Calculates ingredient quantities
   - Triggers shopping list generation

3. **Shopping List Generation**
   - Aggregates ingredients from selected week
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
│   ├── WeekTimeline            # New component for week navigation
│   │   └── WeekIndicator       # Individual week display in timeline
│   ├── WeeklyCalendar
│   ├── DayDetails              # Detailed view of a selected day
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