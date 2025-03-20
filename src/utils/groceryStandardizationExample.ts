import { 
  standardizeGroceryItem, 
  processIngredientsForGrocery
} from './groceryStandardization';
import { Ingredient } from '../types';

/**
 * Example function to demonstrate the grocery standardization utility
 */
export function runGroceryStandardizationExample(): void {
  // Example 1: Converting 1/2 cup chopped bell pepper to whole bell peppers
  const bellPepperExample: Ingredient = {
    name: 'chopped bell pepper',
    quantity: 0.5,
    unit: 'cup',
    notes: null
  };
  
  console.log('Example 1: Converting 1/2 cup chopped bell pepper');
  console.log('Input:', bellPepperExample);
  console.log('Output:', standardizeGroceryItem(bellPepperExample));
  console.log('');
  
  // Example 2: Converting 2 tbsp minced garlic to garlic cloves
  const garlicExample: Ingredient = {
    name: 'minced garlic',
    quantity: 2,
    unit: 'tbsp',
    notes: null
  };
  
  console.log('Example 2: Converting 2 tbsp minced garlic');
  console.log('Input:', garlicExample);
  console.log('Output:', standardizeGroceryItem(garlicExample));
  console.log('');
  
  // Example 3: Converting 3 cups flour to grams
  const flourExample: Ingredient = {
    name: 'all-purpose flour',
    quantity: 3,
    unit: 'cups',
    notes: null
  };
  
  console.log('Example 3: Converting 3 cups flour');
  console.log('Input:', flourExample);
  console.log('Output:', standardizeGroceryItem(flourExample));
  console.log('');
  
  // Example 4: Combining duplicate ingredients
  const duplicateIngredientsExample: Ingredient[] = [
    {
      name: 'chopped bell pepper',
      quantity: 0.5,
      unit: 'cup',
      notes: null
    },
    {
      name: 'sliced bell pepper',
      quantity: 0.5,
      unit: 'cup',
      notes: null
    }
  ];
  
  console.log('Example 4: Combining duplicate ingredients');
  console.log('Input:', duplicateIngredientsExample);
  console.log('Output:', processIngredientsForGrocery(duplicateIngredientsExample));
  console.log('');
  
  // Example 5: Processing a complete recipe
  const recipeExample: Ingredient[] = [
    {
      name: 'chopped onion',
      quantity: 1,
      unit: 'cup',
      notes: null
    },
    {
      name: 'minced garlic',
      quantity: 2,
      unit: 'tbsp',
      notes: null
    },
    {
      name: 'diced red bell pepper',
      quantity: 0.5,
      unit: 'cup',
      notes: null
    },
    {
      name: 'all-purpose flour',
      quantity: 2,
      unit: 'cups',
      notes: null
    },
    {
      name: 'diced tomatoes',
      quantity: 1,
      unit: 'cup',
      notes: null
    }
  ];
  
  console.log('Example 5: Processing a complete recipe');
  console.log('Input: Recipe with multiple ingredients');
  console.log('Output:', processIngredientsForGrocery(recipeExample));
}

// Uncomment this line to run the example
runGroceryStandardizationExample(); 