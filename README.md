# Shopping List App

A modern, user-friendly shopping list application built with React, TypeScript, and Firebase.

## Features

### Recipe Management
- Import recipes from URLs (with support planned for Instagram and TikTok)
- Manual recipe creation with comprehensive form
- View recipe details including:
  - Name, description, and image
  - Prep time, cook time, and servings
  - Ingredients with quantities and units
  - Step-by-step instructions
  - Meal types and cuisine tags
  - Source link (URL, Instagram, or TikTok)
  - Notes and author information
- Edit recipes with a user-friendly form
- Delete recipes with confirmation
- Mark recipes as favorites
- Rate recipes
- Advanced UI features:
  - Sort by name, date, rating
  - Filter by meal type and cuisine
  - Grid/List view toggle
  - Search functionality
  - Custom hooks for recipe import

### Shopping List
- Add items from recipes to shopping list
- Organize items by store
- Mark items as completed
- Filter items by store with improved UI
  - Store filter persistence
  - Clear filter indication
  - "All Stores" view
- View items in combined or sequential mode
- Hide/show completed items
- Move items between stores
- Categorize items (produce, meat, etc.)

### Meal Planning
- Improved two-step workflow:
  - Step 1: Recipe selection or creation
    - Choose from existing recipes
    - Import new recipes on the fly
    - Create new recipes with simplified form (prep time now optional)
  - Step 2: Meal scheduling
    - Assign selected recipe to specific days
    - Select meal type (breakfast, lunch, dinner, etc.)
    - Customize servings if needed
- Clear separation between recipe management and meal planning
- Weekly overview with planned meals
- Enhanced meal organization by meal type
- Simplified required fields:
  - Recipe creation: name, servings, ingredients, instructions
  - Meal scheduling: meal type, at least one day

### User Preferences
- Customize recipe view mode (grid/compact)
- Sort recipes by name, date added, or rating
- Filter recipes by meal type and cuisine
- Show/hide favorites
- Persistent preferences storage

## Project Status

### Completed Features
- Recipe management and storage
- Recipe import from URLs
- Manual recipe creation with full details
- Shopping list creation and management
- Enhanced meal planning functionality
  - Adding recipes to meal plan
  - Multi-day meal assignments
  - Meal type customization
  - Quick add with optional fields
  - Full recipe creation integration
  - Meal deletion
  - Required field validation
- Improved shopping list filtering
  - Enhanced store filtering
  - Filter state persistence
  - Clear UI feedback

### In Progress
- Enhanced meal planning interface
  - Mobile-optimized calendar view
  - Detailed daily meal breakdown
  - Improved meal scheduling UX
  - Meal editing functionality
- Recipe import from social media
  - Instagram integration
  - TikTok integration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file with:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure
```
src/
  ├── components/         # React components
  │   ├── common/        # Shared components
  │   ├── recipes/       # Recipe-related components
  │   ├── mealPlan/      # Meal planning components
  │   └── shopping/      # Shopping list components
  ├── hooks/             # Custom React hooks
  ├── firebase/          # Firebase configuration
  ├── pages/             # Main route components
  ├── services/          # Business logic and API calls
  ├── types/             # TypeScript type definitions
  └── utils/             # Helper functions
```

### Key Components
- `AppLayout`: Main application layout with navigation
- `RecipeList`: Grid/list view of recipes with import functionality
- `RecipeDetail`: Detailed view of a single recipe
- `RecipeEditForm`: Form for creating/editing recipes
- `ShoppingList`: Shopping list management
- `StoreSelector`: Store selection component
- `MealPlanPage`: Weekly meal planning interface
- `RecipeImportModal`: Recipe import options modal
- `RecipeUrlImport`: URL-based recipe import
- `AddMealModal`: Recipe creation and editing form (simplified with optional fields)
- `ScheduleMealModal`: Dedicated form for scheduling selected recipes in the meal plan

### State Management
- Firebase Firestore for data persistence
- React state for UI components
- Custom hooks for shared functionality
- Single-document-per-user data model

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License - see LICENSE file for details 