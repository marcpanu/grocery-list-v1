# Smart Shopping List

A Firebase-powered shopping list application that helps organize your grocery shopping with customizable categories and store-based filtering.

## 🌟 Features

- **Smart Organization**: Items automatically organized by categories and stores
- **Flexible Views**: 
  - Combined View: See all items grouped by category
  - Sequential View: Items grouped by store then category for efficient shopping
- **Store Management**: 
  - Assign items to specific stores
  - Filter items by store
  - Mark stores as active/inactive
- **Category System**:
  - Pre-defined categories with customizable sort order
  - Items automatically sorted by category
- **Item Management**:
  - Add items with quantity and units
  - Mark items as complete/incomplete
  - Assign stores and categories
  - Quick item removal
- **List Preferences**:
  - Toggle completed items visibility
  - Persist view preferences
  - Remember current store filter

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

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
- **Backend**:
  - Firebase
  - Firestore Database
- **Deployment**:
  - Vercel

## 📱 UI Components

### Shopping List Views

- **Combined View**: All items are grouped by category, showing a consolidated view of your entire shopping list
- **Sequential View**: Items are grouped first by store, then by category, making it easier to shop at specific stores

### Item Management

- **Add Item Form**: 
  - Item name (required)
  - Quantity and units (optional)
  - Category selection
  - Store assignment
- **Item Cards**:
  - Checkbox for completion
  - Item name with quantity
  - Category display
  - Store selector
  - Delete button

### List Controls

- Store filter dropdown
- View mode selector (Combined/Sequential)
- Toggle for completed items

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details 