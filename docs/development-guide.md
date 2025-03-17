# Development Guide

## Project Structure

```
shopping-list/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Shared UI components
│   │   ├── recipes/      # Recipe management
│   │   ├── mealPlan/     # Meal planning
│   │   └── shopping/     # Shopping list
│   ├── pages/            # Main application pages
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript type definitions
│   ├── services/         # Business logic
│   ├── firebase/         # Firebase integration
│   └── App.tsx          # Main application component
├── docs/                 # Documentation
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

## Development Plan

### MVP Features (Current)
- Basic recipe management
- Simple weekly meal planning
- Basic shopping list generation
- Core UI components and layouts

### Phase 1: Enhanced Recipe Management
- Recipe import from URLs
- Recipe image processing
- Custom recipe creation interface
- Recipe categories and tags
- Recipe search and filtering

### Phase 2: Advanced Meal Planning
- Drag-and-drop meal scheduler
- Serving size adjustments
- Meal repetition tools
- Calendar integration
- Meal plan templates

### Phase 3: Smart Shopping Lists
- Automatic quantity calculations
- Store-specific organization
- Category management
- Shopping route optimization
- List sharing capabilities

### Phase 4: Configuration and Optimization
- Store management system
- Custom item sequencing
- Category mapping tools
- Multi-store support
- User preferences system

## Development Setup

1. Clone the repository
```bash
git clone [repository-url]
cd shopping-list
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

## Build and Deployment

### Local Build
```bash
npm run build
npm run preview
```

### Vercel Deployment
- Push changes to main branch
- Vercel automatically deploys updates
- Build command: `npm run build`
- Output directory: `dist`
- Node.js version: 18.x

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Contributing

1. Create a new branch for features
2. Follow the existing code style
3. Write tests for new features
4. Submit pull requests with detailed descriptions

## Code Style Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Implement responsive design
- Write meaningful component documentation
- Use meaningful variable and function names 

## Development Status

### Current Status
- Recipe Box: Complete
  - Recipe management
  - Import from URLs
  - Custom hooks for import functionality
  - Grid/List views
  - Sorting and filtering
- Shopping List: Complete
  - Item management
  - Store organization
  - Category system
- Meal Planning: In Progress
  - Weekly overview implemented
  - Add from recipes working
  - Quick add functionality complete
  - Import new recipes integrated
  - Single-document-per-user model implemented

### Recent Changes
1. Recipe Import System
   - Created useRecipeImport custom hook
   - Implemented URL import functionality
   - Added support for future Instagram/TikTok imports
   - Improved error handling and state management

2. Meal Planning Improvements
   - Implemented single-document-per-user model
   - Added recipe selection modal
   - Integrated recipe import functionality
   - Added quick add meal feature
   - Improved loading states

3. Data Model Optimization
   - Simplified meal plan structure
   - Improved query efficiency
   - Prepared for multi-user support
   - Optimized state management

### Known Issues
1. Meal Plan Page
   - Loading state management needs refinement
   - Recipe import modal close/cancel functionality fixed
   - Need to complete recipe-to-meal plan workflow

2. Recipe Import
   - URL import error handling needs improvement
   - Need to add loading states during import
   - Future social media import placeholders

### Next Steps
1. Complete Meal Planning
   - Implement meal editing
   - Add meal deletion
   - Improve weekly view interactions
   - Add drag-and-drop functionality

2. Recipe Import Enhancement
   - Improve error messages
   - Add loading indicators
   - Prepare for social media imports
   - Enhance image handling

3. UI/UX Improvements
   - Add success/error notifications
   - Improve loading states
   - Enhance modal transitions
   - Add keyboard shortcuts

## Technical Details

### Data Model
```typescript
// Meal Plan Structure
interface MealPlan {
  userId: string;
  meals: Array<{
    id: string;
    name: string;
    description?: string;
    type: MealType;
    servings: number;
    days: string[];
    recipeId?: string;
    createdAt: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Recipe Import Hook
interface RecipeImportHook {
  showImportModal: boolean;
  setShowImportModal: (show: boolean) => void;
  showUrlImportModal: boolean;
  closeUrlImport: () => void;
  handleImportOptionSelect: (optionId: string) => void;
  handleUrlImport: (data: { url: string }) => Promise<void>;
}
```

### Implementation Guidelines
1. State Management
   - Use custom hooks for shared logic
   - Keep UI state local when possible
   - Use Firestore for persistence
   - Implement proper loading states

2. Error Handling
   - Provide clear error messages
   - Add retry mechanisms
   - Show loading states
   - Handle edge cases

3. Performance
   - Optimize Firestore queries
   - Implement proper caching
   - Minimize re-renders
   - Use proper data structures

4. Code Organization
   - Keep components focused
   - Extract shared logic to hooks
   - Maintain clear interfaces
   - Document complex logic

## Development Workflow
1. Feature Implementation
   - Create feature branch
   - Implement core functionality
   - Add error handling
   - Implement loading states
   - Add documentation
   - Submit PR

2. Code Review
   - Check error handling
   - Verify loading states
   - Review documentation
   - Test edge cases
   - Verify performance

3. Testing
   - Test happy path
   - Test error cases
   - Test loading states
   - Test edge cases
   - Verify UX

## Implementation Priorities
1. Fix meal plan page loading issue
2. Remove temporary auth components
3. Complete meal planning features
4. Implement authentication
5. Add multi-user support
6. Optimize performance
7. Add advanced features

## Next Steps
1. Debug meal plan page loading
2. Review and update data model
3. Plan authentication implementation
4. Prioritize feature development 