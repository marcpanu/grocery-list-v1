# Shopping List App

A modern, responsive shopping list application built with React, TypeScript, and Firebase. Organize your grocery shopping with customizable categories, stores, and view options.

## Features

### Shopping List Management
- Add, edit, and remove items from your shopping list
- Mark items as completed/unchecked
- Group items by category for better organization
- Assign items to specific stores
- Drag and drop items to reorder or move between stores

### View Options (Persistent)
- **View Modes**
  - Combined view: Items grouped by category
  - Sequential view: Items grouped by store, then category
- **Filter Options**
  - Show/hide completed items
  - Filter by store
- All view preferences are automatically saved and restored between sessions

### Recipe Management
- Import recipes from URLs
- View recipe details including ingredients and instructions
- Add recipe ingredients to your shopping list

### User Interface
- Clean, modern design with Tailwind CSS
- Responsive layout that works on both desktop and mobile
- Intuitive navigation with bottom tab bar
- Quick access to view options in the header

## Technical Details

### State Management
- View settings (view mode, completed items visibility, store filter) are:
  - Stored in Firestore for persistence
  - Loaded when the app starts
  - Updated automatically when changed
  - Maintained consistently across sessions

### Data Storage
- Firebase Firestore for data persistence
- Real-time updates for collaborative use
- Efficient data structure for quick access and updates

### Type Safety
- Built with TypeScript for enhanced reliability
- Strong typing for all components and data structures
- Type-safe Firebase interactions

## Future Plans
- Meal planning functionality (coming soon)
- Recipe editing capabilities
- Enhanced store management
- Collaborative shopping lists

## Development

### Prerequisites
- Node.js
- npm or yarn
- Firebase project with Firestore enabled

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Firebase credentials
4. Start development server: `npm run dev`

### Environment Variables
Required environment variables:
- Firebase configuration (see `.env.example`)

## Contributing
Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and the process for submitting pull requests. 