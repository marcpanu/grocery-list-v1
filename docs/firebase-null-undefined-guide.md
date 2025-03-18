# Handling Null and Undefined Values with Firestore

This guide explains the pattern for handling `null` and `undefined` values in our application, particularly when interacting with Firebase Firestore.

## Understanding the Problem

Firestore and TypeScript have different ways of representing optional values:

- **TypeScript** uses `undefined` for optional fields (marked with the `?` operator in type definitions)
- **Firestore** stores `null` values for empty fields, but doesn't store `undefined` values at all

This difference creates a challenge: our TypeScript interfaces expect `undefined` for optional fields, but when we write data to Firestore, we need to convert these `undefined` values to `null` to ensure they are stored consistently.

## The Pattern

Our application follows this pattern:

1. **TypeScript Interfaces**: Define optional fields with the `?` operator, which allows those fields to be `undefined`.
2. **Application Logic**: Use `undefined` for optional fields within our application code, following TypeScript conventions.
3. **Before Writing to Firestore**: Convert all `undefined` values to `null` before sending to Firestore.
4. **After Reading from Firestore**: Handle `null` values returned from Firestore appropriately based on context.

## Examples

### 1. Defining TypeScript Types with Optional Fields

```typescript
// Example from our ShoppingItem interface
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;          // Optional field can be undefined
  category?: Category;    // Optional field can be undefined
  store?: Store;          // Optional field can be undefined
  checked: boolean;
  addedAt: Timestamp;
}
```

### 2. Converting Undefined to Null Before Writing to Firestore

```typescript
// Example from addItemToList function in firestore.ts
export const addItemToList = async (
  listId: string,
  item: NewShoppingItem
): Promise<string> => {
  // ...

  // Create the new item with the required fields
  const newItem: ShoppingItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: Timestamp.now(),
  };

  // Convert undefined optional fields to null for Firestore
  const firestoreItem = {
    ...newItem,
    unit: newItem.unit ?? null,        // Convert undefined to null
    store: newItem.store ?? null,      // Convert undefined to null
    category: newItem.category ?? null // Convert undefined to null
  };

  const updatedItems = [...list.items, firestoreItem];
  
  await updateDoc(listRef, {
    items: updatedItems,
    updatedAt: Timestamp.now()
  });

  // ...
};
```

### 3. Converting Undefined to Null for Complex Objects

```typescript
// Example from addRecipe function in firestore.ts
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

    // Now safe to write to Firestore
    const docRef = await addDoc(recipesRef, firestoreRecipe);

    // ...
  }
}
```

## Best Practices

1. **Keep TypeScript Interfaces Unchanged**: Continue to use the `?` operator for optional fields in TypeScript interfaces, which allows them to be `undefined`.

2. **Use Nullish Coalescing (`??`) for Conversion**: Use the nullish coalescing operator to convert `undefined` values to `null` before writing to Firestore:
   ```typescript
   const firestoreValue = originalValue ?? null;
   ```

3. **Create Firestore-Ready Objects**: Before writing to Firestore, create a new object with all `undefined` values converted to `null`:
   ```typescript
   const firestoreObject = {
     ...originalObject,
     optionalField: originalObject.optionalField ?? null
   };
   ```

4. **Handle Arrays of Objects**: When an object contains arrays of other objects with optional fields, make sure to map over the array and convert each object's optional fields:
   ```typescript
   const firestoreObject = {
     ...mainObject,
     items: mainObject.items.map(item => ({
       ...item,
       optionalField: item.optionalField ?? null
     }))
   };
   ```

5. **Be Consistent**: Apply this pattern consistently throughout the codebase to avoid inconsistencies and bugs.

## Common Mistakes

1. **Directly Writing TypeScript Objects to Firestore**: This can lead to issues if the objects contain `undefined` values, as Firestore will not store these fields.

2. **Checking for Null Only**: Remember that values could be either `null` or `undefined`, so use nullish coalescing (`??`) rather than just checking for `null`.

3. **Inconsistent Conversion**: Converting in some places but not others can lead to unpredictable behavior.

## Real-World Example: Adding Recipe Ingredients to Grocery List

```typescript
export const addRecipeIngredientsToGroceryList = async (recipe: Recipe): Promise<void> => {
  try {
    // Get the user's shopping list
    const userLists = await getUserShoppingLists('default-user');
    if (userLists.length === 0) {
      throw new Error('No shopping list found');
    }
    
    const list = userLists[0];
    
    // Get user preferences to check for default store
    const preferences = await getUserPreferences();
    const defaultStoreId = preferences?.defaultStore || null;
    const defaultStore = defaultStoreId ? list.stores.find(s => s.id === defaultStoreId) : undefined;
    
    // Add each ingredient to the list
    for (const ingredient of recipe.ingredients) {
      // Convert quantity to number if it's a string
      let quantity: number;
      if (typeof ingredient.quantity === 'string') {
        // Convert string to number if possible, or default to 1
        const parsedQuantity = parseFloat(ingredient.quantity);
        quantity = isNaN(parsedQuantity) ? 1 : parsedQuantity;
      } else {
        quantity = ingredient.quantity;
      }
      
      // Create item matching the TypeScript interface (with undefined for optional fields)
      const newItem: NewShoppingItem = {
        name: ingredient.name,
        quantity: quantity,
        unit: ingredient.unit && ingredient.unit.length > 0 ? ingredient.unit : undefined,
        checked: false,
        store: defaultStore,
        category: undefined
      };
      
      // The addItemToList function handles conversion of undefined to null internally
      await addItemToList(list.id, newItem);
    }
  } catch (error) {
    console.error('Error adding recipe ingredients to grocery list:', error);
    throw new Error('Failed to add recipe ingredients to grocery list');
  }
};
```

## Conclusion

Properly handling `null` and `undefined` values is crucial when working with Firestore. Following the pattern established in this guide will help ensure consistency across the codebase and prevent errors related to undefined values in Firestore operations.

Remember:
- Use `undefined` for optional fields in TypeScript interfaces and application logic
- Convert `undefined` to `null` before writing to Firestore
- Be consistent across the codebase 