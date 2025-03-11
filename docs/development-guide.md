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