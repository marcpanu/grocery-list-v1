import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  arrayUnion,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { 
  ShoppingList, 
  ShoppingItem, 
  NewShoppingItem, 
  UpdateShoppingItem,
  Store,
  Category,
  ViewMode,
  Recipe,
  RecipePreview,
  UserPreferences,
  UserData,
  StoredCredential,
  MealPlan,
  PantryItem,
  Week,
  Meal
} from '../types/index';
import { encryptPassword } from '../utils/encryption';
import { DEFAULT_PANTRY_ITEMS } from '../utils/defaultPantryItems';
import { calculateScalingFactor, updateWeekScalingFactors } from '../utils/scalingCalculations';

// Collection names
const COLLECTIONS = {
  RECIPES: 'recipes',
  MEAL_PLANS: 'mealPlans',
  WEEKS: 'weeks',
  MEALS: 'meals',
  SHOPPING_LISTS: 'shoppingLists',
  STORES: 'stores',
  CATEGORIES: 'categories',
  USER_PREFERENCES: 'userPreferences'
} as const;

// User data collection reference
const userDataCollection = collection(db, 'userData');

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
export async function addRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  try {
    const recipesRef = collection(db, 'recipes');
    
    // Convert undefined optional fields to null for Firestore
    const firestoreRecipe = {
      ...recipe,
      description: recipe.description ?? null,
      prepTime: recipe.prepTime ?? null,
      cookTime: recipe.cookTime ?? null,
      totalTime: recipe.totalTime ?? null,
      displayTotalTime: recipe.displayTotalTime ?? null,
      imageUrl: recipe.imageUrl ?? null,
      notes: recipe.notes ?? null,
      mealTypes: recipe.mealTypes ?? [],
      cuisine: recipe.cuisine ?? null,
      rating: recipe.rating ?? null,
      dateAdded: Timestamp.fromDate(recipe.dateAdded),
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        unit: ing.unit ?? null,
        notes: ing.notes ?? null
      }))
    };

    const docRef = await addDoc(recipesRef, firestoreRecipe);

    const newRecipe: Recipe = {
      ...recipe,
      id: docRef.id,
    };

    return newRecipe;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw new Error('Failed to add recipe');
  }
}

export const getRecipe = async (recipeId: string): Promise<Recipe | null> => {
  const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
  const recipeSnap = await getDoc(recipeRef);
  return recipeSnap.exists() ? convertDoc<Recipe>(recipeSnap) : null;
};

export const getAllRecipes = async (): Promise<RecipePreview[]> => {
  const recipesRef = collection(db, COLLECTIONS.RECIPES);
  const q = query(recipesRef, orderBy('dateAdded', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      imageUrl: data.imageUrl,
      displayTotalTime: data.displayTotalTime,
      mealTypes: data.mealTypes || [],
      isFavorite: data.isFavorite,
      cuisine: data.cuisine || [],
      rating: data.rating,
      dateAdded: data.dateAdded instanceof Timestamp ? data.dateAdded.toDate() : data.dateAdded
    } as RecipePreview;
  });
};

export const getFavoriteRecipes = async (): Promise<RecipePreview[]> => {
  const recipesRef = collection(db, COLLECTIONS.RECIPES);
  const q = query(
    recipesRef,
    where('isFavorite', '==', true),
    orderBy('dateAdded', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      imageUrl: data.imageUrl,
      displayTotalTime: data.displayTotalTime,
      mealTypes: data.mealTypes || [],
      isFavorite: data.isFavorite,
      cuisine: data.cuisine || [],
      rating: data.rating,
      dateAdded: data.dateAdded.toDate()
    } as RecipePreview;
  });
};

export const getRecentRecipes = async (count: number = 5): Promise<RecipePreview[]> => {
  const recipesRef = collection(db, COLLECTIONS.RECIPES);
  const q = query(
    recipesRef,
    orderBy('dateAdded', 'desc'),
    limit(count)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      imageUrl: data.imageUrl,
      displayTotalTime: data.displayTotalTime,
      mealTypes: data.mealTypes || [],
      isFavorite: data.isFavorite,
      cuisine: data.cuisine || [],
      rating: data.rating,
      dateAdded: data.dateAdded.toDate()
    } as RecipePreview;
  });
};

export const updateRecipe = async (
  recipeId: string,
  recipeData: Partial<Omit<Recipe, 'id' | 'dateAdded'>>
): Promise<void> => {
  const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
  await updateDoc(recipeRef, {
    ...recipeData,
    lastModified: Timestamp.now()
  });
};

export const toggleRecipeFavorite = async (recipeId: string, isFavorite: boolean): Promise<void> => {
  const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
  await updateDoc(recipeRef, {
    isFavorite,
    lastModified: Timestamp.now()
  });
};

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  const recipeRef = doc(db, COLLECTIONS.RECIPES, recipeId);
  await deleteDoc(recipeRef);
};

// Meal Plan Operations
export const addMealPlan = async (userId: string, mealPlanData: DocumentData) => {
  // Find or create the week for the meal
  const weekId = mealPlanData.weekId || (await getCurrentWeek(userId)).id;
  console.log('weekId:', weekId);
  console.log('mealPlanData weekId:', mealPlanData.weekId);
  console.log('current week:', (await getCurrentWeek(userId)).id);
  
  // Convert the meal data
  const mealWithTimestamp = {
    userId,
    weekId,
    name: mealPlanData.meals[0].name,
    description: mealPlanData.meals[0].description,
    mealPlanMeal: mealPlanData.meals[0].mealPlanMeal,
    days: mealPlanData.meals[0].days,
    servings: mealPlanData.meals[0].servings,
    recipeId: mealPlanData.meals[0].recipeId,
    createdAt: mealPlanData.meals[0].createdAt instanceof Timestamp 
      ? mealPlanData.meals[0].createdAt 
      : Timestamp.fromDate(mealPlanData.meals[0].createdAt)
  };

  // Add the meal to the specified week
  await addMealToWeek(userId, weekId, mealWithTimestamp);
  
  // Ensure the meal plan exists
  await getMealPlanWithWeeks(userId);
};

export const getMealPlan = async (userId: string) => {
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
  const mealPlanSnap = await getDoc(mealPlanRef);
  return mealPlanSnap.exists() ? mealPlanSnap.data() : null;
};

export const getUserMealPlans = async (userId: string): Promise<MealPlan[]> => {
  console.log('Getting meal plans for user:', userId);
  
  try {
    // Get the meal plan with weeks
    const mealPlan = await getMealPlanWithWeeks(userId);
    console.log('Retrieved meal plan with weeks:', mealPlan);
    
    return [mealPlan];
  } catch (error) {
    console.error('Error getting meal plans:', error);
    return [];
  }
};

export const deleteMeal = async (mealId: string): Promise<void> => {
  try {
    const mealRef = doc(db, COLLECTIONS.MEALS, mealId);
    await deleteDoc(mealRef);
  } catch (error) {
    console.error("Error deleting meal:", error);
    throw error;
  }
};

export const updateMeal = async (mealId: string, updates: Partial<DocumentData>): Promise<void> => {
  try {
    const mealRef = doc(db, COLLECTIONS.MEALS, mealId);
    await updateDoc(mealRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating meal:", error);
    throw error;
  }
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

export const deleteStore = async (storeId: string): Promise<void> => {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  await deleteDoc(storeRef);
};

export const updateStoreOrder = async (storeId: string, newOrder: number): Promise<void> => {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  await updateDoc(storeRef, { order: newOrder });
};

export const reorderStores = async (stores: Store[]): Promise<void> => {
  const batch = writeBatch(db);
  
  stores.forEach((store, index) => {
    const storeRef = doc(db, COLLECTIONS.STORES, store.id);
    batch.update(storeRef, { order: index });
  });
  
  await batch.commit();
};

export const updateStore = async (storeId: string, storeData: Partial<Store>): Promise<void> => {
  const storeRef = doc(db, COLLECTIONS.STORES, storeId);
  return updateDoc(storeRef, storeData);
};

// Category Operations
export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
  const docRef = await addDoc(categoriesRef, category);
  return {
    id: docRef.id,
    ...category
  };
};

export const getCategories = async (): Promise<Category[]> => {
  const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
  const q = query(categoriesRef, orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => convertDoc<Category>(doc));
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  await deleteDoc(categoryRef);
};

export const updateCategoryOrder = async (categoryId: string, newOrder: number): Promise<void> => {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  await updateDoc(categoryRef, { order: newOrder });
};

export const reorderCategories = async (categories: Category[]): Promise<void> => {
  const batch = writeBatch(db);
  
  categories.forEach((category, index) => {
    const categoryRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
    batch.update(categoryRef, { order: index });
  });
  
  await batch.commit();
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Category>): Promise<void> => {
  const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
  return updateDoc(categoryRef, categoryData);
};

// Shopping List Operations
export const createShoppingList = async (
  userId: string,
  name: string = 'Shopping List'
): Promise<ShoppingList> => {
  const shoppingListsRef = collection(db, COLLECTIONS.SHOPPING_LISTS);
  const now = Timestamp.now();
  
  // Get stores and categories
  const stores = await getStores();
  const categories = await getCategories();
  
  const newList: ShoppingList = {
    id: '', // Will be set after creation
    userId,
    name,
    items: [],
    stores,
    categories,
    viewMode: 'combined',
    showCompleted: true,
    currentStore: 'all',
    createdAt: now,
    updatedAt: now,
    status: 'active'
  };

  const docRef = await addDoc(shoppingListsRef, newList);
  return {
    ...newList,
    id: docRef.id
  };
};

export const getShoppingList = async (listId: string): Promise<ShoppingList | null> => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  const listSnap = await getDoc(listRef);
  
  if (!listSnap.exists()) return null;
  
  // Get stores and categories
  const stores = await getStores();
  const categories = await getCategories();
  
  const data = listSnap.data();
  const list: ShoppingList = {
    id: listSnap.id,
    userId: data.userId,
    name: data.name,
    items: data.items || [],
    stores,
    categories,
    viewMode: (data.viewMode || 'combined') as ViewMode,
    showCompleted: data.showCompleted ?? true,
    currentStore: data.currentStore || 'all',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    status: data.status || 'active'
  };
  
  return list;
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
  
  // Get stores and categories once for all lists
  const stores = await getStores();
  const categories = await getCategories();
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    const list: ShoppingList = {
      id: doc.id,
      userId: data.userId,
      name: data.name,
      items: data.items || [],
      stores,
      categories,
      viewMode: (data.viewMode || 'combined') as ViewMode,
      showCompleted: data.showCompleted ?? true,
      currentStore: data.currentStore || 'all',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      status: data.status || 'active'
    };
    return list;
  });
};

// Shopping List Item Operations
export const addItemToList = async (
  listId: string,
  item: NewShoppingItem
): Promise<string> => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  const list = await getShoppingList(listId);
  
  if (!list) throw new Error('Shopping list not found');
  
  // Create the new item with the required fields
  const newItem: ShoppingItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: Timestamp.now().toDate(),
  };

  // Convert undefined optional fields to null for Firestore
  const firestoreItem = {
    ...newItem,
    unit: newItem.unit ?? null,
    store: newItem.store ?? null,
    category: newItem.category ?? null
  };

  const updatedItems = [...list.items, firestoreItem];
  
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

// User Preferences Operations
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    // Get the preferences document
    const userPrefsDoc = doc(db, COLLECTIONS.USER_PREFERENCES, 'default');
    const docSnap = await getDoc(userPrefsDoc);
    
    // Default preferences if none exist
    const defaultPrefs: UserPreferences = {
      id: 'default',
      recipeViewMode: 'grid' as const,
      recipeSortBy: 'name' as const,
      recipeSortOrder: 'asc' as const,
      recipeFilters: {
        mealTypes: [],
        cuisines: [],
        showFavorites: false
      },
      defaultStore: null,
      pantryItems: DEFAULT_PANTRY_ITEMS,
      // Shopping list defaults
      shoppingListViewMode: 'combined',
      shoppingListShowCompleted: true,
      shoppingListCurrentStore: 'all',
      lastUpdated: Timestamp.now()
    };
    
    // If document doesn't exist, create it with default preferences
    if (!docSnap.exists()) {
      await setDoc(userPrefsDoc, defaultPrefs);
      return defaultPrefs;
    }
    
    // Return the preferences or apply defaults for missing fields
    const data = docSnap.data() as UserPreferences;
    
    // If pantryItems don't exist in the document, add the default ones
    if (!data.pantryItems) {
      data.pantryItems = DEFAULT_PANTRY_ITEMS;
      await updateDoc(userPrefsDoc, { pantryItems: DEFAULT_PANTRY_ITEMS });
    }
    
    // Check for missing shopping list settings and add defaults if needed
    const updates: Record<string, any> = {};
    let needsUpdate = false;
    
    if (data.shoppingListViewMode === undefined) {
      updates.shoppingListViewMode = 'combined';
      data.shoppingListViewMode = 'combined';
      needsUpdate = true;
    }
    
    if (data.shoppingListShowCompleted === undefined) {
      updates.shoppingListShowCompleted = true;
      data.shoppingListShowCompleted = true;
      needsUpdate = true;
    }
    
    if (data.shoppingListCurrentStore === undefined) {
      updates.shoppingListCurrentStore = 'all';
      data.shoppingListCurrentStore = 'all';
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await updateDoc(userPrefsDoc, updates);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (
  updates: Partial<Omit<UserPreferences, 'id' | 'lastUpdated'>>
): Promise<void> => {
  const DEFAULT_USER_ID = 'default';
  const prefsRef = doc(db, COLLECTIONS.USER_PREFERENCES, DEFAULT_USER_ID);
  
  await updateDoc(prefsRef, {
    ...updates,
    lastUpdated: Timestamp.now()
  });
};

export const getUserData = async (): Promise<UserData> => {
  const userDataDoc = doc(userDataCollection, 'default');
  const docSnap = await getDoc(userDataDoc);

  if (!docSnap.exists()) {
    // Initialize with default values
    const defaultData: UserData = {
      id: 'default',
      imageStorage: {
        totalSize: 0,
        imageCount: 0
      },
      credentials: []
    };

    await setDoc(userDataDoc, defaultData);
    return defaultData;
  }

  return docSnap.data() as UserData;
};

export const addStoredCredential = async (
  domain: string,
  username: string,
  password: string
): Promise<void> => {
  const userDataDoc = doc(userDataCollection, 'default');
  const userData = await getUserData();

  // Check if credentials already exist for this domain
  if (userData.credentials.some(cred => cred.domain === domain)) {
    throw new Error('Credentials already exist for this domain');
  }

  const newCredential: StoredCredential = {
    id: crypto.randomUUID(),
    domain,
    username,
    encryptedPassword: await encryptPassword(password),
    lastUsed: Timestamp.now()
  };

  await updateDoc(userDataDoc, {
    credentials: arrayUnion(newCredential)
  });
};

export const deleteStoredCredential = async (credentialId: string): Promise<void> => {
  const userDataDoc = doc(userDataCollection, 'default');
  const userData = await getUserData();

  const updatedCredentials = userData.credentials.filter(cred => cred.id !== credentialId);

  await updateDoc(userDataDoc, {
    credentials: updatedCredentials
  });
};

export const updateImageStorageStats = async (
  totalSize: number,
  imageCount: number
): Promise<void> => {
  const userDataDoc = doc(userDataCollection, 'default');
  await updateDoc(userDataDoc, {
    'imageStorage.totalSize': totalSize,
    'imageStorage.imageCount': imageCount
  });
};

export const deleteAllImages = async (): Promise<void> => {
  const userDataDoc = doc(userDataCollection, 'default');
  
  // Reset image storage stats
  await updateDoc(userDataDoc, {
    'imageStorage.totalSize': 0,
    'imageStorage.imageCount': 0
  });

  // TODO: Actually delete the images from Firebase Storage
  // This will be implemented when we add image upload functionality
};

// Update user pantry items
export const updatePantryItems = async (pantryItems: PantryItem[]): Promise<void> => {
  try {
    const userPrefsDoc = doc(db, COLLECTIONS.USER_PREFERENCES, 'default');
    await updateDoc(userPrefsDoc, {
      pantryItems,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating pantry items:', error);
    throw new Error('Failed to update pantry items');
  }
};

// Reset pantry items to default
export const resetPantryItemsToDefault = async (): Promise<void> => {
  try {
    const userPrefsDoc = doc(db, COLLECTIONS.USER_PREFERENCES, 'default');
    await updateDoc(userPrefsDoc, {
      pantryItems: DEFAULT_PANTRY_ITEMS,
      lastUpdated: Timestamp.now()
    });
  } catch (error) {
    console.error('Error resetting pantry items:', error);
    throw new Error('Failed to reset pantry items');
  }
};

// Function to check if an ingredient is in the pantry items list
const isIngredientInPantry = (ingredientName: string, pantryItems: PantryItem[]): boolean => {
  const lowercaseName = ingredientName.toLowerCase().trim();
  
  // Check if the ingredient name matches any pantry item name or variant
  return pantryItems.some(item => {
    // Check main name match
    if (lowercaseName === item.name.toLowerCase() || 
        lowercaseName.includes(item.name.toLowerCase())) {
      return true;
    }
    
    // Check variants
    return item.variants.some(variant => 
      lowercaseName === variant.toLowerCase() || 
      lowercaseName.includes(variant.toLowerCase())
    );
  });
};

// Function to add recipe ingredients to the grocery list with pantry exclusion and quantity adjustment
export const addRecipeIngredientsToGroceryList = async (recipe: Recipe, weekId?: string): Promise<void> => {
  try {
    console.log(`Adding recipe ${recipe.id} ingredients to grocery list${weekId ? ` for week ${weekId}` : ''}`);

    // Get the user's shopping list
    const userLists = await getUserShoppingLists('default');
    if (userLists.length === 0) {
      throw new Error('No shopping list found');
    }
    
    const list = userLists[0];
    console.log('Shopping list for ingredient processing:', list.id);
    console.log('Available categories:', list.categories);
    
    // Get user preferences to check for default store and pantry items
    const preferences = await getUserPreferences();
    const defaultStoreId = preferences?.defaultStore || null;
    
    // Find the store object by ID
    let defaultStore = undefined;
    if (defaultStoreId && list.stores) {
      defaultStore = list.stores.find((s: Store) => s.id === defaultStoreId);
      console.log('Default store found:', defaultStoreId, defaultStore ? defaultStore.name : 'none');
    }
    
    const pantryItems = preferences?.pantryItems || [];

    // Get scaling factor from week if weekId is provided
    let scalingFactor = 1;
    console.log('weekId:', weekId);
    console.log('scalingFactor:', scalingFactor);

    if (weekId) {
      const weekRef = doc(db, COLLECTIONS.WEEKS, weekId);
      const weekSnap = await getDoc(weekRef);
     
      if (weekSnap.exists()) {
        const week = weekSnap.data() as Week;
        if (week.scalingFactors?.[recipe.id]) {
          scalingFactor = week.scalingFactors[recipe.id];
          console.log(`Using week scaling factor for recipe ${recipe.id}: ${scalingFactor}`);
        }
      }
    }
    
    // Import the ingredient processing utilities
    const { processIngredientsToShoppingItems } = await import('../services/recipeIngredientProcessing');
    const { processIngredientsForGrocery } = await import('../utils/groceryStandardization');
    
    // First - standardize ingredients for grocery shopping (convert to whole items where appropriate)
    const standardizedItems = processIngredientsForGrocery(recipe.ingredients.map(ing => ({
      ...ing,
      quantity: typeof ing.quantity === 'string' 
        ? parseFloat(ing.quantity) || 1 
        : ing.quantity * scalingFactor
    })));
    
    console.log('Standardized grocery items:', standardizedItems);
    
    // Then - convert them to shopping items with categories
    // Create properly formatted ingredients for the categorization process
    const formattedIngredients = standardizedItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: null  // Add the required notes property
    }));
    
    // Process ingredients to standardized shopping items with automatic categorization
    const shoppingItems = processIngredientsToShoppingItems(
      formattedIngredients,
      1, // We've already applied the scaling factor
      list.categories // Pass the user's categories
    );
    
    console.log('Processed shopping items with categories:', shoppingItems);
    
    // Add each processed item to the list
    for (const item of shoppingItems) {
      // Skip pantry items
      if (isIngredientInPantry(item.name, pantryItems)) {
        console.log('Skipping pantry item:', item.name);
        continue;
      }
      
      // Apply default store if not already set
      if (!item.store && defaultStore) {
        console.log('Applying default store to item:', item.name);
        item.store = defaultStore;
      }
      
      // Create the final item to add, making sure the category is properly set
      const itemToAdd: NewShoppingItem = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category, // This will be the category from categorizeIngredient
        store: item.store,
        checked: false,
        order: 0 // Default order
      };
      
      console.log('Adding item to list with category:', itemToAdd.category?.name);
      await addItemToList(list.id, itemToAdd);
    }
  } catch (error) {
    console.error('Error adding recipe ingredients to grocery list:', error);
    throw new Error('Failed to add recipe ingredients to grocery list');
  }
};

// Helper function to get the ISO date string for a given date
const getISODate = (date: Date): string => {
  // Format as YYYY-MM-DD in local timezone to avoid UTC conversion issues
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Helper function to get the start and end dates of a week given a date
const getWeekDates = (date: Date): { startDate: string; endDate: string } => {
  const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Calculate the date of Sunday (start of week)
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - day); // Move back to Sunday
  
  // Calculate the date of Saturday (end of week)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Move forward to Saturday
  
  return {
    startDate: getISODate(startDate),
    endDate: getISODate(endDate)
  };
};

// Create a new week or get existing week for the given date
export const createOrGetWeek = async (userId: string, date: Date): Promise<Week> => {
  const { startDate, endDate } = getWeekDates(date);
  
  // Check if a week already exists for this date range
  const weeksRef = collection(db, COLLECTIONS.WEEKS);
  const q = query(
    weeksRef,
    where('userId', '==', userId),
    where('startDate', '==', startDate),
    where('endDate', '==', endDate)
  );
  
  const snapshot = await getDocs(q);
  
  // If week exists, return it
  if (!snapshot.empty) {
    const weekDoc = snapshot.docs[0];
    return {
      id: weekDoc.id,
      ...weekDoc.data()
    } as Week;
  }
  
  // Create a new week if it doesn't exist
  const now = Timestamp.now();
  const newWeek: Omit<Week, 'id'> = {
    userId,
    startDate,
    endDate,
    label: `${startDate} to ${endDate}`,
    createdAt: now.toDate(),
    updatedAt: now.toDate()
  };
  
  const weekRef = await addDoc(weeksRef, newWeek);
  
  const createdWeek = {
    id: weekRef.id,
    ...newWeek
  };

  // Update the meal plan to include this week
  try {
    const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
    const mealPlanSnap = await getDoc(mealPlanRef);

    if (mealPlanSnap.exists()) {
      // Get the existing weeks array or initialize an empty one
      const existingWeeks = mealPlanSnap.data().weeks || [];
      
      // Check if the week ID already exists in the array
      const weekExists = existingWeeks.some((week: any) => week.id === createdWeek.id);
      
      if (!weekExists) {
        // Add the new week to the weeks array
        await updateDoc(mealPlanRef, {
          weeks: arrayUnion(createdWeek),
          updatedAt: now
        });
      }
    }
  } catch (error) {
    console.error('Error updating meal plan with new week:', error);
    // Continue with the function even if this update fails
  }
  
  return createdWeek;
};

// Get all weeks for a user
export const getWeeks = async (userId: string): Promise<Week[]> => {
  const weeksRef = collection(db, COLLECTIONS.WEEKS);
  const q = query(
    weeksRef,
    where('userId', '==', userId),
    orderBy('startDate', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Week));
};

// Get or create the current week
export const getCurrentWeek = async (userId: string): Promise<Week> => {
  return createOrGetWeek(userId, new Date());
};

// Get or create a week for the specified date
export const getWeekForDate = async (userId: string, date: Date): Promise<Week> => {
  return createOrGetWeek(userId, date);
};

// Get a meal plan for a user, creating it if it doesn't exist
export const getMealPlanWithWeeks = async (userId: string): Promise<MealPlan> => {
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
  const mealPlanSnap = await getDoc(mealPlanRef);
  
  // Get or create the current week
  const currentWeek = await getCurrentWeek(userId);
  
  if (mealPlanSnap.exists()) {
    const data = mealPlanSnap.data();
    
    // Check if the meal plan has the new weeks structure
    if (!data.weeks) {
      // Run migration to move old meals to new structure
      await migrateMealsToWeeks(userId);
      
      // Get the updated meal plan after migration
      const updatedMealPlanSnap = await getDoc(mealPlanRef);
      const updatedData = updatedMealPlanSnap.data() || {};
      
      return {
        id: updatedMealPlanSnap.id,
        userId,
        weeks: updatedData.weeks || [currentWeek],
        currentWeekId: updatedData.currentWeekId || currentWeek.id,
        createdAt: updatedData.createdAt ? updatedData.createdAt.toDate() : new Date(),
        updatedAt: updatedData.updatedAt ? updatedData.updatedAt.toDate() : new Date()
      };
    }
    
    // Return existing meal plan with weeks
    return {
      id: mealPlanSnap.id,
      userId,
      weeks: data.weeks,
      currentWeekId: data.currentWeekId || currentWeek.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    };
  }
  
  // Create new meal plan with current week
  const now = Timestamp.now();
  const newMealPlan: Omit<MealPlan, 'id'> = {
    userId,
    weeks: [currentWeek],
    currentWeekId: currentWeek.id,
    createdAt: now.toDate(),
    updatedAt: now.toDate()
  };
  
  await setDoc(mealPlanRef, newMealPlan);
  
  return {
    id: userId,
    ...newMealPlan
  };
};

// Set the current active week for a meal plan
export const setCurrentWeek = async (userId: string, weekId: string): Promise<void> => {
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
  await updateDoc(mealPlanRef, {
    currentWeekId: weekId,
    updatedAt: Timestamp.now()
  });
};

// Add a meal to a specific week
export const addMealToWeek = async (userId: string, weekId: string, mealData: Omit<Meal, 'id' | 'userId' | 'weekId' | 'createdAt'>): Promise<Meal> => {
  console.log(`Adding meal to week ${weekId}:
    - Recipe ID: ${mealData.recipeId}
    - Desired servings: ${mealData.servings}`);

  const mealsRef = collection(db, COLLECTIONS.MEALS);
  const now = Timestamp.now();
  
  const newMeal: Omit<Meal, 'id'> = {
    userId,
    weekId,
    ...mealData,
    createdAt: now.toDate()
  };
  
  const mealRef = await addDoc(mealsRef, newMeal);
  const addedMeal = {
    id: mealRef.id,
    ...newMeal
  };

  // If this meal is associated with a recipe, update the week's scaling factors
  if (mealData.recipeId) {
    try {
      // Get all meals for this week
      const weekMeals = await getMealsByWeek(userId, weekId);
      
      // Get all unique recipe IDs from the meals
      const recipeIds = [...new Set(weekMeals
        .filter(meal => meal.recipeId)
        .map(meal => meal.recipeId as string)
      )];
      
      // Get all recipes used in this week
      const recipes = await Promise.all(
        recipeIds.map(async id => {
          const recipe = await getRecipe(id);
          return recipe;
        })
      );
      
      // Create a map of recipe data
      const recipeMap = recipes.reduce((acc, recipe) => {
        if (recipe) {
          acc[recipe.id] = recipe;
        }
        return acc;
      }, {} as { [recipeId: string]: Recipe });

      // Get the week document
      const weekRef = doc(db, COLLECTIONS.WEEKS, weekId);
      const weekSnap = await getDoc(weekRef);
      
      if (weekSnap.exists()) {
        const week = { id: weekSnap.id, ...weekSnap.data() } as Week;
        
        // Calculate new scaling factors
        const { scalingFactors, totalServings } = await updateWeekScalingFactors(
          week,
          weekMeals,
          recipeMap
        );

        console.log(`Updating week ${weekId} with new scaling factors:`, {
          scalingFactors,
          totalServings
        });

        // Update the week document with new scaling factors
        await updateDoc(weekRef, {
          scalingFactors,
          totalServings,
          updatedAt: now
        });
      }
    } catch (error) {
      console.error('Error updating week scaling factors:', error);
      // Don't throw the error - we still want to return the added meal
    }
  }
  
  return addedMeal;
};

// Get all meals for a specific week
export const getMealsByWeek = async (userId: string, weekId: string): Promise<Meal[]> => {
  const mealsRef = collection(db, COLLECTIONS.MEALS);
  const q = query(
    mealsRef,
    where('userId', '==', userId),
    where('weekId', '==', weekId)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
};

// Update a meal
export const updateMealDetails = async (mealId: string, updates: Partial<Omit<Meal, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  console.log(`Updating meal ${mealId} with:`, updates);

  const mealRef = doc(db, COLLECTIONS.MEALS, mealId);
  const mealSnap = await getDoc(mealRef);
  
  if (!mealSnap.exists()) {
    console.error(`Meal ${mealId} not found`);
    return;
  }

  const meal = { id: mealId, ...mealSnap.data() } as Meal;
  
  // Update the meal
  await updateDoc(mealRef, updates);

  // If servings were updated and this meal has a recipe, update the week's scaling factors
  if (updates.servings !== undefined && meal.recipeId) {
    try {
      // Get all meals for this week
      const weekMeals = await getMealsByWeek(meal.userId, meal.weekId);
      
      // Get all unique recipe IDs from the meals
      const recipeIds = [...new Set(weekMeals
        .filter(meal => meal.recipeId)
        .map(meal => meal.recipeId as string)
      )];
      
      // Get all recipes used in this week
      const recipes = await Promise.all(
        recipeIds.map(async id => {
          const recipe = await getRecipe(id);
          return recipe;
        })
      );
      
      // Create a map of recipe data
      const recipeMap = recipes.reduce((acc, recipe) => {
        if (recipe) {
          acc[recipe.id] = recipe;
        }
        return acc;
      }, {} as { [recipeId: string]: Recipe });

      // Get the week document
      const weekRef = doc(db, COLLECTIONS.WEEKS, meal.weekId);
      const weekSnap = await getDoc(weekRef);
      
      if (weekSnap.exists()) {
        const week = { id: weekSnap.id, ...weekSnap.data() } as Week;
        
        // Calculate new scaling factors
        const { scalingFactors, totalServings } = await updateWeekScalingFactors(
          week,
          weekMeals.map(m => m.id === mealId ? { ...m, ...updates } : m), // Use updated meal data
          recipeMap
        );

        console.log(`Updating week ${meal.weekId} with new scaling factors:`, {
          scalingFactors,
          totalServings
        });

        // Update the week document with new scaling factors
        await updateDoc(weekRef, {
          scalingFactors,
          totalServings,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating week scaling factors:', error);
      // Don't throw the error - the meal update was successful
    }
  }
};

// Delete a meal
export const deleteMealById = async (mealId: string): Promise<void> => {
  console.log(`Deleting meal ${mealId}`);

  const mealRef = doc(db, COLLECTIONS.MEALS, mealId);
  const mealSnap = await getDoc(mealRef);

  if (!mealSnap.exists()) {
    console.error(`Meal ${mealId} not found`);
    return;
  }

  const meal = { id: mealId, ...mealSnap.data() } as Meal;
  
  // Delete the meal
  await deleteDoc(mealRef);

  // If this meal had a recipe, update the week's scaling factors
  if (meal.recipeId) {
    try {
      // Get all remaining meals for this week
      const weekMeals = await getMealsByWeek(meal.userId, meal.weekId);
      
      // Get all unique recipe IDs from the remaining meals
      const recipeIds = [...new Set(weekMeals
        .filter(meal => meal.recipeId)
        .map(meal => meal.recipeId as string)
      )];
      
      // Get all recipes used in this week
      const recipes = await Promise.all(
        recipeIds.map(async id => {
          const recipe = await getRecipe(id);
          return recipe;
        })
      );
      
      // Create a map of recipe data
      const recipeMap = recipes.reduce((acc, recipe) => {
        if (recipe) {
          acc[recipe.id] = recipe;
        }
        return acc;
      }, {} as { [recipeId: string]: Recipe });

      // Get the week document
      const weekRef = doc(db, COLLECTIONS.WEEKS, meal.weekId);
      const weekSnap = await getDoc(weekRef);
      
      if (weekSnap.exists()) {
        const week = { id: weekSnap.id, ...weekSnap.data() } as Week;
        
        // Calculate new scaling factors (meal is already deleted from weekMeals)
        const { scalingFactors, totalServings } = await updateWeekScalingFactors(
          week,
          weekMeals,
          recipeMap
        );

        console.log(`Updating week ${meal.weekId} with new scaling factors:`, {
          scalingFactors,
          totalServings
        });

        // Update the week document with new scaling factors
        await updateDoc(weekRef, {
          scalingFactors,
          totalServings,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error updating week scaling factors:', error);
      // Don't throw the error - the meal deletion was successful
    }
  }
};

// Migration function to move existing meals to the new model
export const migrateMealsToWeeks = async (userId: string): Promise<void> => {
  console.log('Starting migration of meals to weeks-based model');
  
  try {
    // Get the old meal plan
    const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
    const mealPlanSnap = await getDoc(mealPlanRef);
    
    if (!mealPlanSnap.exists()) {
      console.log('No meal plan to migrate');
      return;
    }
    
    const data = mealPlanSnap.data();
    
    // If we already have weeks, don't migrate again
    if (data.weeks) {
      console.log('Meal plan already has weeks, skipping migration');
      return;
    }
    
    // Create a current week
    const currentWeek = await getCurrentWeek(userId);
    console.log('Created current week for migration:', currentWeek);
    
    // Check if we have old meals to migrate
    if (data.meals && Array.isArray(data.meals) && data.meals.length > 0) {
      console.log(`Found ${data.meals.length} meals to migrate`);
      
      // Migrate each meal to the new system
      for (const oldMeal of data.meals) {
        // Convert the meal
        const newMeal = {
          userId,
          name: oldMeal.name,
          description: oldMeal.description,
          mealPlanMeal: oldMeal.mealPlanMeal || oldMeal.type, // Handle old type field
          days: oldMeal.days,
          weekId: currentWeek.id,
          servings: oldMeal.servings,
          recipeId: oldMeal.recipeId,
          createdAt: oldMeal.createdAt instanceof Timestamp 
            ? oldMeal.createdAt.toDate() 
            : new Date(oldMeal.createdAt)
        };
        
        // Add to the new collection
        console.log('Migrating meal:', newMeal);
        await addMealToWeek(userId, currentWeek.id, newMeal);
      }
      
      console.log('Migration of meals completed');
    } else {
      console.log('No meals to migrate');
    }
    
    // Update the meal plan to use the new model
    await updateDoc(mealPlanRef, {
      weeks: [currentWeek],
      currentWeekId: currentWeek.id,
      updatedAt: Timestamp.now()
    });
    
    console.log('Updated meal plan to use weeks-based model');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

// Get all meals for the currently selected week
export const getMealsByCurrentWeek = async (userId: string): Promise<Meal[]> => {
  // Get the meal plan to identify the current week
  const mealPlan = await getMealPlanWithWeeks(userId);
  
  if (!mealPlan.currentWeekId) {
    console.error('No current week set for meal plan');
    return [];
  }
  
  // Get all meals for the current week
  return getMealsByWeek(userId, mealPlan.currentWeekId);
};

// Migration function to move shopping list view settings to UserPreferences
export const migrateShoppingListSettings = async (): Promise<void> => {
  try {
    // Get the current shopping list
    const userLists = await getUserShoppingLists('default-user');
    if (userLists.length === 0) return;
    
    const list = userLists[0];
    
    // Get current user preferences
    const userPrefs = await getUserPreferences();
    if (!userPrefs) return;
    
    // Check if shopping list has view settings that should be migrated
    const updates: Record<string, any> = {};
    let needsUpdate = false;
    
    // Only update preferences if shopping list has the settings
    if (list.viewMode !== undefined) {
      updates.shoppingListViewMode = list.viewMode;
      needsUpdate = true;
    }
    
    if (list.showCompleted !== undefined) {
      updates.shoppingListShowCompleted = list.showCompleted;
      needsUpdate = true;
    }
    
    if (list.currentStore !== undefined) {
      updates.shoppingListCurrentStore = list.currentStore;
      needsUpdate = true;
    }
    
    // Update user preferences if needed
    if (needsUpdate) {
      console.log('Migrating shopping list settings to user preferences:', updates);
      await updateUserPreferences(updates);
    }
  } catch (error) {
    console.error('Error migrating shopping list settings:', error);
  }
};

export const clearList = async (listId: string): Promise<void> => {
  const listRef = doc(db, COLLECTIONS.SHOPPING_LISTS, listId);
  await updateDoc(listRef, {
    items: [],
    updatedAt: Timestamp.now()
  });
}; 