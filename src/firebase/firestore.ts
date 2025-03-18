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
  PantryItem
} from '../types/index';
import { encryptPassword } from '../utils/encryption';
import { DEFAULT_PANTRY_ITEMS } from '../utils/defaultPantryItems';

// Collection names
const COLLECTIONS = {
  RECIPES: 'recipes',
  MEAL_PLANS: 'mealPlans',
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
      cookTime: recipe.cookTime ?? null,
      totalTime: recipe.totalTime ?? null,
      imageUrl: recipe.imageUrl ?? null,
      notes: recipe.notes ?? null,
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
      prepTime: data.prepTime,
      mealTypes: data.mealTypes,
      isFavorite: data.isFavorite,
      cuisine: data.cuisine?.[0], // Take first cuisine if array
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
      prepTime: data.prepTime,
      mealTypes: data.mealTypes,
      isFavorite: data.isFavorite,
      cuisine: data.cuisine?.[0], // Take first cuisine if array
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
      prepTime: data.prepTime,
      mealTypes: data.mealTypes,
      isFavorite: data.isFavorite,
      cuisine: data.cuisine?.[0], // Take first cuisine if array
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
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
  const now = Timestamp.now();
  
  // Convert dates to Timestamps, handling both Date and Timestamp inputs
  const mealWithTimestamp = {
    ...mealPlanData.meals[0],
    createdAt: mealPlanData.meals[0].createdAt instanceof Timestamp 
      ? mealPlanData.meals[0].createdAt 
      : Timestamp.fromDate(mealPlanData.meals[0].createdAt)
  };

  // Try to get existing meal plan
  const mealPlanSnap = await getDoc(mealPlanRef);
  
  if (mealPlanSnap.exists()) {
    // Update existing meal plan
    await updateDoc(mealPlanRef, {
      meals: arrayUnion(mealWithTimestamp),
      updatedAt: now
    });
  } else {
    // Create new meal plan
    await setDoc(mealPlanRef, {
      userId,
      meals: [mealWithTimestamp],
      createdAt: now,
      updatedAt: now
    });
  }
};

export const getMealPlan = async (userId: string) => {
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
  const mealPlanSnap = await getDoc(mealPlanRef);
  return mealPlanSnap.exists() ? mealPlanSnap.data() : null;
};

export const getUserMealPlans = async (userId: string): Promise<MealPlan[]> => {
  console.log('Getting meal plans for user:', userId);
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
  const mealPlanSnap = await getDoc(mealPlanRef);
  
  if (!mealPlanSnap.exists()) {
    console.log('No meal plan found for user');
    return [];
  }

  const data = mealPlanSnap.data();
  console.log('Raw meal plan data:', data);
  
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
  const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date();
  
  const mealPlan: MealPlan = {
    id: mealPlanSnap.id,
    userId,
    meals: data.meals.map((meal: any) => ({
      ...meal,
      createdAt: meal.createdAt instanceof Timestamp ? meal.createdAt.toDate() : new Date(meal.createdAt)
    })),
    createdAt,
    updatedAt
  };
  
  console.log('Processed meal plan:', mealPlan);
  return [mealPlan];
};

export const deleteMeal = async (userId: string, mealId: string): Promise<void> => {
  const mealPlanRef = doc(db, COLLECTIONS.MEAL_PLANS, userId);
  const mealPlanSnap = await getDoc(mealPlanRef);
  
  if (!mealPlanSnap.exists()) {
    throw new Error('Meal plan not found');
  }

  const data = mealPlanSnap.data();
  const updatedMeals = data.meals.filter((meal: any) => meal.id !== mealId);
  
  await updateDoc(mealPlanRef, {
    meals: updatedMeals,
    updatedAt: Timestamp.now()
  });
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
    addedAt: Timestamp.now(),
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
export const addRecipeIngredientsToGroceryList = async (recipe: Recipe, servingMultiplier: number = 1): Promise<void> => {
  try {
    // Get the user's shopping list
    const userLists = await getUserShoppingLists('default');
    if (userLists.length === 0) {
      throw new Error('No shopping list found');
    }
    
    const list = userLists[0];
    console.log('User shopping list:', list);
    
    // Get user preferences to check for default store and pantry items
    const preferences = await getUserPreferences();
    console.log('User preferences:', preferences);
    const defaultStoreId = preferences?.defaultStore || null;
    console.log('Default store ID:', defaultStoreId);
    
    // Fix: Find the store object by ID and ensure it's found before using it
    let defaultStore = undefined;
    if (defaultStoreId && list.stores) {
      console.log('Available stores:', list.stores);
      defaultStore = list.stores.find((s: Store) => s.id === defaultStoreId);
      console.log('Default store found:', defaultStoreId, defaultStore); // Debug log
    } else {
      console.log('Default store not found or no stores available');
    }
    
    const pantryItems = preferences?.pantryItems || [];
    
    // Add each ingredient to the list
    for (const ingredient of recipe.ingredients) {
      // Skip pantry items
      if (isIngredientInPantry(ingredient.name, pantryItems)) {
        continue;
      }
      
      // Convert quantity to number if it's a string
      let quantity: number;
      if (typeof ingredient.quantity === 'string') {
        // Convert string to number if possible, or default to 1
        const parsedQuantity = parseFloat(ingredient.quantity);
        quantity = isNaN(parsedQuantity) ? 1 : parsedQuantity;
      } else {
        quantity = ingredient.quantity;
      }
      
      // Apply serving multiplier
      quantity = quantity * servingMultiplier;
      
      // Create item matching the TypeScript interface (with undefined for optional fields)
      const newItem: NewShoppingItem = {
        name: ingredient.name,
        quantity: quantity,
        unit: ingredient.unit && ingredient.unit.length > 0 ? ingredient.unit : undefined,
        checked: false,
        store: defaultStore, // This should be the actual store object, not just the ID
        category: undefined
      };
      
      console.log('Adding item with store:', newItem.name, newItem.store); // Debug log
      
      await addItemToList(list.id, newItem);
    }
  } catch (error) {
    console.error('Error adding recipe ingredients to grocery list:', error);
    throw new Error('Failed to add recipe ingredients to grocery list');
  }
}; 