# Smart Shopping List

A modern, Firebase-powered shopping list application that helps organize your grocery shopping with customizable categories, store-based filtering, and recipe management capabilities.

## 🌟 Features

### Shopping List Management
- **Smart Organization**: 
  - Automatic categorization of items
  - Customizable category ordering
  - Store-based item grouping
- **Flexible Views**: 
  - Combined View: See all items grouped by category
  - Sequential View: Items grouped by store then category for efficient shopping
  - Responsive layout adapting to different screen sizes
- **Store Management**: 
  - Assign items to specific stores
  - Filter items by store
  - Mark stores as active/inactive
  - Store preferences persistence
- **Category System**:
  - Pre-defined categories with customizable sort order
  - Automatic item sorting by category
  - Category management interface
- **Item Management**:
  - Add items with quantity and units
  - Mark items as complete/incomplete
  - Assign stores and categories
  - Quick item removal
  - Batch operations support

### Recipe Management
- **Recipe Organization**:
  - Grid and list view options
  - Sort by name, date, or rating
  - Filter by meal type and cuisine
  - Favorite recipes system
- **Recipe Details**:
  - Preparation time and servings
  - Ingredient lists with quantities
  - Step-by-step instructions
  - Notes and tips section
- **Recipe Import**:
  - URL-based recipe import
  - Support for multiple recipe formats
  - Automatic ingredient parsing

### Data Management
- **User Preferences**:
  - View mode persistence
  - Filter settings
  - Sort order preferences
  - Completed items visibility
- **Data Security**:
  - Encrypted credential storage
  - Secure data transmission
  - User data protection
- **Performance**:
  - Optimized loading states
  - Efficient data caching
  - Responsive UI updates

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Environment Setup

Create a `.env` file with the following Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🛠️ Tech Stack

### Frontend
- **Core**:
  - React 18 with TypeScript
  - Vite for build tooling
  - React Router for navigation
- **UI/UX**:
  - Tailwind CSS for styling
  - Headless UI for accessible components
  - Heroicons for consistent iconography
  - Custom animations and transitions
- **State Management**:
  - React hooks for local state
  - Context API for global state
  - Custom hooks for shared logic

### Backend
- **Firebase Platform**:
  - Firestore Database for data storage
  - Firebase Storage for image handling
  - Firebase Authentication (planned)
- **Security**:
  - Web Crypto API for encryption
  - Secure credential storage
  - Data validation and sanitization

### Development Tools
- **Code Quality**:
  - TypeScript for type safety
  - ESLint for code linting
  - Prettier for code formatting
- **Testing** (planned):
  - Jest for unit testing
  - React Testing Library for component testing
  - Cypress for E2E testing

## 📱 UI Components

### Core Components
- **PageHeader**: Consistent header across all pages
- **ConfirmDialog**: Reusable confirmation dialogs
- **LoadingSpinner**: Unified loading states
- **Modal**: Base modal component for forms and dialogs

### Shopping List Components
- **ShoppingList**: Main list component with:
  - Combined and Sequential views
  - Store filtering
  - Completed items toggle
- **ShoppingListItem**: Individual item component
- **AddItemModal**: Form for adding new items
- **StoreSelector**: Store selection dropdown

### Recipe Components
- **RecipeList**: Main recipe browsing interface
- **RecipeCard**: Individual recipe preview
- **RecipeDetail**: Detailed recipe view
- **RecipeImport**: Recipe import interface

### Settings Components
- **Settings**: Main settings interface
- **StoreManager**: Store configuration
- **CategoryManager**: Category organization
- **DataManagement**: Data and privacy settings

## 🔄 Development Progress

### Completed Features
- ✅ Basic shopping list functionality
- ✅ Store and category management
- ✅ Multiple view modes
- ✅ Recipe management system
- ✅ Data encryption implementation
- ✅ Confirmation dialogs
- ✅ Loading states and animations
- ✅ Responsive design

### In Progress
- 🔄 Recipe import system refinement
- 🔄 Performance optimizations
- 🔄 Enhanced error handling
- 🔄 User feedback improvements

### Planned Features
- 📋 User authentication system
- 📋 Shared shopping lists
- 📋 Offline support
- 📋 Mobile app version
- 📋 Advanced recipe features
- 📋 Shopping history analytics

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details 