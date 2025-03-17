# Shopping List App

A modern, user-friendly shopping list application built with React, TypeScript, and Firebase.

## Features

### Recipe Management
- Import recipes from URLs
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

### Shopping List
- Add items from recipes to shopping list
- Organize items by store
- Mark items as completed
- Filter items by store
- View items in combined or sequential mode
- Hide/show completed items
- Move items between stores
- Categorize items (product, meat, etc.)

### Meal Planning
- Weekly overview of planned meals
- Day-by-day meal details
- Add meals from existing recipes
- Quick add meals without recipes
- Import new recipes
- Categorize meals by type (breakfast, lunch, dinner, snack, dessert)

### User Preferences
- Customize recipe view mode (grid/compact)
- Sort recipes by name, date added, or rating
- Filter recipes by meal type and cuisine
- Show/hide favorites

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
  ├── contexts/          # React contexts
  ├── firebase/          # Firebase configuration
  ├── pages/             # Main route components
  ├── services/          # Business logic and API calls
  ├── types/             # TypeScript type definitions
  └── utils/             # Helper functions
```

### Key Components
- `AppLayout`: Main application layout with navigation
- `RecipeList`: Grid/list view of recipes
- `RecipeDetail`: Detailed view of a single recipe
- `RecipeEditForm`: Form for creating/editing recipes
- `ShoppingList`: Shopping list management
- `StoreSelector`: Store selection component
- `MealPlanPage`: Weekly meal planning interface
- `FloatingActionButton`: Quick action menu

### State Management
- Firebase Firestore for data persistence
- React state for UI components
- Context for global state (if needed)

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License - see LICENSE file for details 