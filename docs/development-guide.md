# Development Guide

## Project Structure

```
shopping-list/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Main application pages
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # Global styles and Tailwind config
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
- Shopping List: Complete
- Meal Planning: In Progress
- Authentication: Planned
- Multi-user Support: Planned

### Known Issues
1. Meal Plan Page
   - Infinite loading state in meal plan page
   - Need to remove auth components temporarily
   - Data model needs review for meal plan structure

2. Recipe Import
   - Some URL parsing edge cases need handling
   - Image storage optimization needed

3. Shopping List
   - Store reordering needs optimization
   - Category management UI needs improvement

### Planned Features
1. Authentication
   - Implement Firebase Authentication
   - Update data model for multi-user support
   - Add user profile management
   - Implement proper security rules

2. Meal Planning
   - Complete weekly overview
   - Add meal editing functionality
   - Implement meal deletion
   - Add drag-and-drop meal reordering

3. Recipe Management
   - Add bulk recipe import
   - Implement recipe sharing
   - Add recipe versioning
   - Improve image handling

4. Shopping List
   - Add list sharing
   - Implement list templates
   - Add price tracking
   - Improve store management

### Recent Changes
1. Recipe Source Feature
   - Added support for different source types (URL, Instagram, TikTok)
   - Implemented source type detection
   - Added source link display

2. Recipe Import Improvements
   - Enhanced image extraction
   - Added custom cuisine support
   - Improved metadata handling
   - Better error handling

### Technical Decisions
1. Data Model
   - Using Firestore for data persistence
   - Multi-user ready structure
   - Currently using 'default' user ID
   - Collections:
     - recipes
     - mealPlans
     - shoppingLists
     - stores
     - categories
     - userPreferences
     - userData

2. Authentication
   - Planned implementation of Firebase Auth
   - Data model already supports multi-user
   - Security rules to be implemented

3. State Management
   - React state for UI components
   - Context for global state
   - Firestore for persistence

## Development Workflow

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent file structure
- Document complex functions
- Add type definitions for all data structures

### Testing
- Unit tests for utility functions
- Component tests for UI elements
- Integration tests for data flow
- E2E tests for critical paths

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Update documentation
5. Create PR
6. Code review
7. Merge to main

### Documentation
- Keep README focused on current functionality
- Update development guide with progress
- Document API changes
- Maintain type definitions

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