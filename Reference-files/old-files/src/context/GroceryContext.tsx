import * as React from 'react';
import { GroceryItem, ViewMode } from '../types';

interface State {
  items: GroceryItem[];
  showCompleted: boolean;
  currentStore: string;
  viewMode: ViewMode;
}

type Action =
  | { type: 'ADD_ITEM'; payload: GroceryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'TOGGLE_ITEM'; payload: string }
  | { type: 'MOVE_ITEM'; payload: { itemId: string; storeId: string } }
  | { type: 'TOGGLE_SHOW_COMPLETED' }
  | { type: 'SET_CURRENT_STORE'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode };

const initialState: State = {
  items: [],
  showCompleted: true,
  currentStore: 'all',
  viewMode: 'combined',
};

function groceryReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'TOGGLE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, completed: !item.completed }
            : item
        ),
      };
    case 'MOVE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, currentStore: action.payload.storeId }
            : item
        ),
      };
    case 'TOGGLE_SHOW_COMPLETED':
      return {
        ...state,
        showCompleted: !state.showCompleted,
      };
    case 'SET_CURRENT_STORE':
      return {
        ...state,
        currentStore: action.payload,
      };
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };
    default:
      return state;
  }
}

const GroceryContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function GroceryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(groceryReducer, initialState);

  return (
    <GroceryContext.Provider value={{ state, dispatch }}>
      {children}
    </GroceryContext.Provider>
  );
}

export function useGrocery() {
  const context = React.useContext(GroceryContext);
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
} 