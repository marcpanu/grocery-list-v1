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

### Context-Aware Processing System
```typescript
interface IngredientConversion {
  name: string;                 // Standardized name for shopping
  density: number;              // Grams per cup
  countEquivalent?: number;     // Grams per whole item (if applicable)
  defaultUnit: string;          // Standard unit for shopping
  variants: string[];           // Alternative names to match
  category: string;             // Category for organization
  isPrecise?: boolean;         // Indicates ingredients requiring exact measurements (e.g., baking ingredients)
  preferCount?: boolean;       // Indicates ingredients better tracked by count
  commonForms?: string[];      // List of preparation forms
}

interface ProcessingContext {
  isScalable: boolean;         // Whether the recipe allows scaling
  scalingFactor: number;       // total servings / base servings - used to scale ingredient quantities
}
```

The system processes ingredients through several stages:

1. **Ingredient Classification**
   - Determines the appropriate conversion type:
     - Weight-based for precise ingredients (isPrecise: true)
     - Count-based for whole items (preferCount: true)
     - Volume-based for flexible conversion
   - Uses exact matching against ingredient names and variants
     - Matches must be exact, no partial matching
     - Example: "flour" matches "flour" or "all-purpose flour" (variant)
     - Example: "good bread flour" does not match "flour"
   - Identifies preparation forms from commonForms list
   - Checks recipe scalability requirements
   - Uses ingredient's isPrecise flag to determine measurement handling

2. **Unit Standardization**
   - Volume measurements → cups (base unit)
   - Weight measurements → grams (base unit)
     - Always maintains gram precision for isPrecise ingredients
   - Count-based measurements preserved
   - Density-based conversions when needed

3. **Quantity Processing**
   - **Weight-based Processing**
     - Used for: Baking ingredients (isPrecise: true)
     - Always converts to grams
     - Maintains exact measurements
     - Example: "1 cup flour" → "120g flour"

   - **Count-based Processing**
     - Used for: Produce, packaged items (preferCount: true)
     - Converts to whole units
     - Uses density and count equivalent data
     - Example: "1/2 cup chopped bell pepper" → "1 bell pepper"

   - **Volume-based Processing**
     - Used for: Liquids, flexible ingredients
     - Converts based on context
     - Uses density data when needed
     - Example: "1 cup milk" → "240ml milk"

4. **Scaling Handling**
   - Checks recipe's `isScalable` flag
   - For scalable recipes:
     - Uses scalingFactor (total servings / base servings) to adjust quantities
     - Example: If a recipe serves 4 and we need 8 servings, scalingFactor = 8/4 = 2
     - Maintains unit consistency when scaling
     - For isPrecise ingredients:
       - Maintains exact gram measurements when scaling
       - Uses precise decimal arithmetic
       - No rounding of measurements
     - For other ingredients:
       - Rounds to appropriate precision based on ingredient type
   - For non-scalable recipes:
     - Preserves original measurements exactly
     - Provides scaling warnings to user
     - Maintains exact ratios for precision recipes

### Implementation Flow

```typescript
function processIngredient(
  ingredient: Ingredient,
  context: ProcessingContext
): ProcessedIngredient {
  // 1. Get conversion data
  const conversionData = findIngredientConversion(ingredient.name);
  
  // 2. Determine processing type
  const processingType = determineProcessingType(ingredient, conversionData);
  
  // 3. Standardize units
  const standardized = standardizeUnits(ingredient, processingType);
  
  // 4. Apply scaling if allowed
  const scaled = context.isScalable
    ? applyScaling(standardized, context.scalingFactor)
    : standardized;
  
  // 5. Format for shopping
  return formatForShopping(scaled, conversionData);
}

// Scaling factor calculation example:
interface Week {
  id: string;
  recipes: {
    [recipeId: string]: {
      baseServings: number;    // Original recipe servings
      totalServings: number;   // Total servings needed for the week
      scalingFactor: number;   // totalServings / baseServings
    };
  };
}
```

### Key Functions

- `findIngredientConversion`: Matches ingredients with conversion data
- `standardizeGroceryItem`: Applies smart unit conversion
- `processIngredientsForGrocery`: Handles batch processing with scaling factors
- `convertToCups`: Standardizes volume measurements
- `calculateScalingFactor`: Computes scaling factor based on total and base servings

### Benefits

1. **Accuracy**
   - Precise measurements for critical ingredients
   - Appropriate rounding for different types
   - Consistent unit handling

2. **Usability**
   - Shopping-friendly quantities
   - Intuitive unit presentation
   - Clear scaling limitations

3. **Flexibility**
   - Context-aware processing
   - Recipe-specific handling
   - Customizable conversion rules

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