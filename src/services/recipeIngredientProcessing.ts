import { Ingredient, NewShoppingItem, Category } from '../types';
import { categorizeIngredient, standardizeIngredient, combineIngredients } from '../utils/ingredientProcessing';

/**
 * Process ingredients to standardized shopping items with automatic categorization
 * 
 * @param ingredients Array of ingredients to process
 * @param servings Serving multiplier (default 1)
 * @param userCategories The user's custom categories for categorization
 * @returns Array of shopping list items with quantities and categories
 */
export const processIngredientsToShoppingItems = (
  ingredients: Ingredient[],
  servingsMultiplier: number = 1,
  userCategories: Category[] = []
): NewShoppingItem[] => {
  console.log("Process ingredients called with:", ingredients.length, "ingredients");
  console.log("Servings:", servingsMultiplier);
  console.log("User categories:", userCategories);

  // Group ingredients by name to combine duplicates
  const groupedIngredients: Record<string, Ingredient[]> = {};
  
  ingredients.forEach(ingredient => {
    const name = ingredient.name.trim().toLowerCase();
    if (!groupedIngredients[name]) {
      groupedIngredients[name] = [];
    }
    groupedIngredients[name].push(ingredient);
  });

  // Process grouped ingredients into shopping items
  const shoppingItems: NewShoppingItem[] = [];
  
  Object.values(groupedIngredients).forEach(group => {
    // If multiple entries of the same ingredient, combine them
    if (group.length > 1) {
      try {
        // Extract combined ingredient data with adjusted quantities
        const combinedItems = group.map(item => {
          let quantity = typeof item.quantity === 'string' 
            ? parseFloat(item.quantity) || 1 
            : item.quantity;
            
          // Apply servings multiplier
          quantity = quantity * servingsMultiplier;
          
          return {
            name: item.name,
            quantity: quantity,
            unit: item.unit || null
          };
        });
        
        // Use utility to combine ingredients
        const combined = combineIngredients(combinedItems);
        
        // Find category for the ingredient
        const category = categorizeIngredient(combined.name, userCategories);
        console.log(`Category for ${combined.name}:`, category ? category.name : 'none found');
        
        // Create shopping item
        const newItem = {
          name: combined.name,
          quantity: combined.quantity,
          unit: combined.unit,
          category: category,
          checked: false
        };
        
        console.log(`Adding shopping item with category: ${newItem.name} -> ${newItem.category ? newItem.category.name : 'none'}`);
        shoppingItems.push(newItem);
        
      } catch (error) {
        console.error("Error combining ingredients:", error);
        // Process each ingredient individually as fallback
        group.forEach(singleItem => processIndividualItem(singleItem));
      }
    } else {
      // Process single ingredient
      const singleItem = group[0];
      processIndividualItem(singleItem);
    }
    
    // Helper function to process individual ingredient
    function processIndividualItem(singleItem: Ingredient) {
      console.log("Processing single ingredient:", singleItem.name);
      
      // Convert quantity if needed and apply serving multiplier
      let quantity = typeof singleItem.quantity === 'string' 
          ? parseFloat(singleItem.quantity) || 1 
          : singleItem.quantity;
          
      quantity = quantity * servingsMultiplier;
      
      // Standardize the ingredient
      try {
        const standardized = standardizeIngredient(
          quantity,
          singleItem.unit,
          singleItem.name
        );
        console.log("Standardized ingredient:", standardized);
        
        // Find category for the ingredient
        const category = categorizeIngredient(singleItem.name, userCategories);
        console.log(`Category for ${singleItem.name}:`, category ? category.name : 'none found');
        
        // Create shopping item
        const newItem = {
          name: singleItem.name,
          quantity: standardized.quantity,
          unit: standardized.unit,
          category: category,
          checked: false
        };
        
        console.log(`Adding shopping item with category: ${newItem.name} -> ${newItem.category ? newItem.category.name : 'none'}`);
        shoppingItems.push(newItem);
        
      } catch (error) {
        console.error("Error standardizing ingredient:", error);
        // If standardization fails, add the item as is with its category
        const category = categorizeIngredient(singleItem.name, userCategories);
        console.log(`Category for ${singleItem.name} (fallback):`, category ? category.name : 'none found');
        
        // Create shopping item after error
        const newItem = {
          name: singleItem.name,
          quantity: quantity,
          unit: singleItem.unit || undefined,
          category: category,
          checked: false
        };
        
        console.log(`Adding shopping item with category (after error): ${newItem.name} -> ${newItem.category ? newItem.category.name : 'none'}`);
        shoppingItems.push(newItem);
      }
    }
  });
  
  console.log("Final shopping items:", shoppingItems);
  return shoppingItems;
};

/**
 * Process multiple recipes' ingredients into a combined shopping list
 * 
 * @param recipesWithServings Array of recipes with their serving info
 * @param userCategories The user's custom categories
 * @returns Array of combined shopping list items
 */
export const processMultipleRecipesToShoppingList = (
  recipesWithServings: Array<{
    recipeId: string;
    name: string;
    ingredients: Ingredient[];
    servings: number;
  }>,
  userCategories: Category[] = []
): NewShoppingItem[] => {
  console.log("Processing multiple recipes:", recipesWithServings.length);
  // Process each recipe's ingredients
  const allIngredients: Ingredient[] = [];
  
  recipesWithServings.forEach(recipe => {
    console.log("Processing recipe:", recipe.name, "with servings:", recipe.servings);
    recipe.ingredients.forEach(ingredient => {
      allIngredients.push({
        ...ingredient,
        // Store original recipe info in notes if needed
        notes: `${recipe.name}${ingredient.notes ? `, ${ingredient.notes}` : ''}`
      });
    });
  });
  
  // Process all ingredients as one big batch to handle duplicates across recipes
  return processIngredientsToShoppingItems(allIngredients, 1, userCategories); // Pass userCategories
}; 