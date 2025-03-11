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
  DocumentData
} from 'firebase/firestore';
import { db } from './config';

// Collection names
const COLLECTIONS = {
  RECIPES: 'recipes',
  MEAL_PLANS: 'mealPlans',
  SHOPPING_LISTS: 'shoppingLists'
} as const;

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

// Shopping List Operations
export const addShoppingList = async (userId: string, shoppingListData: DocumentData) => {
  const shoppingListsRef = collection(db, COLLECTIONS.SHOPPING_LISTS);
  return addDoc(shoppingListsRef, {
    ...shoppingListData,
    userId,
    createdAt: new Date(),
    status: 'active'
  });
};

export const getShoppingList = async (shoppingListId: string) => {
  const shoppingListRef = doc(db, COLLECTIONS.SHOPPING_LISTS, shoppingListId);
  const shoppingListSnap = await getDoc(shoppingListRef);
  return shoppingListSnap.exists() ? shoppingListSnap.data() : null;
};

export const getUserShoppingLists = async (userId: string) => {
  const shoppingListsRef = collection(db, COLLECTIONS.SHOPPING_LISTS);
  const q = query(
    shoppingListsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateShoppingList = async (shoppingListId: string, shoppingListData: Partial<DocumentData>) => {
  const shoppingListRef = doc(db, COLLECTIONS.SHOPPING_LISTS, shoppingListId);
  return updateDoc(shoppingListRef, shoppingListData);
}; 