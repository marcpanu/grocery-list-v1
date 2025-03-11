import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentData,
  Timestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { 
  ShoppingList, 
  ShoppingItem, 
  NewShoppingItem, 
  UpdateShoppingItem,
  Store 
} from '../types/shopping-list';

// Collection names
const COLLECTIONS = {
  RECIPES: 'recipes',
  MEAL_PLANS: 'mealPlans',
  SHOPPING_LISTS: 'shoppingLists',
  STORES: 'stores'
} as const;

// Helper function to convert Firestore data to our types
const convertDoc = <T extends DocumentData>(
  doc: QueryDocumentSnapshot
): T & { id: string } => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    // Convert Timestamps to Timestamps (they're already correct type from Firestore)
    ...(data.createdAt && { createdAt: data.createdAt }),
    ...(data.updatedAt && { updatedAt: data.updatedAt }),
    ...(data.addedAt && { addedAt: data.addedAt })
  } as T & { id: string };
};

// Recipe Operations
export const addRecipe = async (recipeData: DocumentData) => {
  const recipesRef = collection(db, COLLECTIONS.RECIPES);
  return addDoc(recipesRef, recipeData);
};

export const getRecipe = async (recipeId: string) => {
  const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
  const recipeSnap = await getDoc(recipeRef);
  return recipeSnap.exists() ? recipeSnap.data() : null;
};

export const getAllRecipes = async () => {
  const recipesRef = collection(db, COLLECTIONS.RECIPES);
  const querySnapshot = await getDocs(recipesRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateRecipe = async (recipeId: string, recipeData: Partial<DocumentData>) => {
  const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
  return updateDoc(recipeRef, recipeData);
};

export const deleteRecipe = async (recipeId: string) => {
  const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
  return deleteDoc(recipeRef);
};

// Meal Plan Operations
export const addMealPlan = async (userId: string, mealPlanData: DocumentData) => {
  const mealPlansRef = collection(db, COLLECTIONS.MEAL_PLANS);
  return addDoc(mealPlansRef, {
    ...mealPlanData,
    userId,
    createdAt: new Date()
  });
};

export const getMealPlan = async (mealPlanId: string) => {
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, mealPlanId);
  const mealPlanSnap = await getDoc(mealPlanRef);
  return mealPlanSnap.exists() ? mealPlanSnap.data() : null;
};

export const getUserMealPlans = async (userId: string) => {
  const mealPlansRef = collection(db, COLLECTIONS.MEAL_PLANS);
  const q = query(
    mealPlansRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Store Operations
export const addStore = async (store: Omit<Store, 'id'>): Promise<Store> => {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const docRef = await addDoc(storesRef, store);
  return {
    id: docRef.id,
    ...store
  };
};

export const getStores = async (): Promise<Store[]> => {
  const storesRef = collection(db, COLLECTIONS.STORES);
  const q = query(storesRef, orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => convertDoc<Store>(doc));
};

// Shopping List Operations
export const createShoppingList = async (
  userId: string,
  name: string = 'Shopping List'
): Promise<ShoppingList> => {
  const shoppingListsRef = collection(db, COLLECTIONS.SHOPPING_LISTS);
  const now = Timestamp.now();
  
  const newList: Omit<ShoppingList, 'id'> = {
    userId,
    name,
    items: [],
    createdAt: now,
    updatedAt: now,
    status: 'active'
  };

  const docRef = await addDoc(shoppingListsRef, newList);
  return {
    id: docRef.id,
    ...newList
  };
};

export const getShoppingList = async (listId: string): Promise<ShoppingList | null> => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  const listSnap = await getDoc(listRef);
  
  if (!listSnap.exists()) return null;
  
  return {
    id: listSnap.id,
    ...listSnap.data()
  } as ShoppingList;
};

export const getUserShoppingLists = async (userId: string): Promise<ShoppingList[]> => {
  const listsRef = collection(db, COLLECTIONS.SHOPPING_LISTS);
  const q = query(
    listsRef,
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('updatedAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => convertDoc<ShoppingList>(doc));
};

// Shopping List Item Operations
export const addItemToList = async (
  listId: string,
  item: NewShoppingItem
): Promise<string> => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  const list = await getShoppingList(listId);
  
  if (!list) throw new Error('Shopping list not found');
  
  const newItem: ShoppingItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: Timestamp.now(),
  };

  const updatedItems = [...list.items, newItem];
  
  await updateDoc(listRef, {
    items: updatedItems,
    updatedAt: Timestamp.now()
  });

  return newItem.id;
};

export const updateItemInList = async (
  listId: string,
  itemId: string,
  updates: UpdateShoppingItem
) => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  const list = await getShoppingList(listId);
  
  if (!list) throw new Error('Shopping list not found');
  
  const updatedItems = list.items.map((item: ShoppingItem) => 
    item.id === itemId
      ? { ...item, ...updates }
      : item
  );

  await updateDoc(listRef, {
    items: updatedItems,
    updatedAt: Timestamp.now()
  });
};

export const removeItemFromList = async (
  listId: string,
  itemId: string
) => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  const list = await getShoppingList(listId);
  
  if (!list) throw new Error('Shopping list not found');
  
  const updatedItems = list.items.filter((item: ShoppingItem) => item.id !== itemId);
  
  await updateDoc(listRef, {
    items: updatedItems,
    updatedAt: Timestamp.now()
  });
};

export const toggleItemCheck = async (
  listId: string,
  itemId: string,
  checked: boolean
) => {
  await updateItemInList(listId, itemId, { checked });
};

export const clearCheckedItems = async (listId: string) => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  const list = await getShoppingList(listId);
  
  if (!list) throw new Error('Shopping list not found');
  
  const uncheckedItems = list.items.filter((item: ShoppingItem) => !item.checked);
  
  await updateDoc(listRef, {
    items: uncheckedItems,
    updatedAt: Timestamp.now()
  });
};

// Helper functions for store-specific operations
export const getItemsByStore = async (listId: string, storeId: string): Promise<ShoppingItem[]> => {
  const list = await getShoppingList(listId);
  if (!list) throw new Error('Shopping list not found');
  
  return list.items.filter((item: ShoppingItem) => item.store?.id === storeId);
};

export const updateItemStore = async (
  listId: string,
  itemId: string,
  store: Store | undefined
) => {
  await updateItemInList(listId, itemId, { store });
};

export const updateShoppingList = async (shoppingListId: string, shoppingListData: Partial<DocumentData>) => {
  const shoppingListRef = doc(db, COLLECTIONS.SHOPPING_LISTS, shoppingListId);
  return updateDoc(shoppingListRef, shoppingListData);
}; 