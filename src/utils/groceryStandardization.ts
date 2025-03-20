import { Ingredient } from '../types';

/**
 * Mini database of ingredient conversions - structured to match industry food databases
 * For each ingredient we track:
 * - name: the standardized name
 * - density: the weight in grams per cup (for volume to weight conversion)
 * - countEquivalent: how many grams equals one whole item (for weight to count conversion)
 * - defaultUnit: the standard unit for shopping
 * - variants: alternative names for matching
 * - category: the food category for organization
 */
interface IngredientConversion {
  name: string;                 // Standardized name for shopping
  density: number;              // Grams per cup
  countEquivalent?: number;     // Grams per whole item (if applicable)
  defaultUnit: string;          // Standard unit for shopping
  variants: string[];           // Alternative names to match
  category: string;             // Category for organization
}

// Mini database of common ingredients with volume-to-weight-to-count conversions
const ingredientConversions: IngredientConversion[] = [
  {
    name: 'bell pepper',
    density: 150,             // 1 cup chopped = ~150g
    countEquivalent: 150,     // 1 medium bell pepper = ~150g
    defaultUnit: 'whole',
    variants: ['red bell pepper', 'green bell pepper', 'yellow bell pepper', 'orange bell pepper', 'sweet pepper', 'chopped bell pepper', 'diced bell pepper', 'sliced bell pepper'],
    category: 'produce'
  },
  {
    name: 'onion',
    density: 160,             // 1 cup chopped = ~160g
    countEquivalent: 180,     // 1 medium onion = ~180g
    defaultUnit: 'whole',
    variants: ['yellow onion', 'white onion', 'red onion', 'chopped onion', 'diced onion', 'sliced onion'],
    category: 'produce'
  },
  {
    name: 'garlic',
    density: 150,             // 1 cup = ~150g
    countEquivalent: 5,       // 1 clove = ~5g
    defaultUnit: 'clove',
    variants: ['minced garlic', 'chopped garlic', 'crushed garlic', 'garlic clove', 'garlic cloves'],
    category: 'produce'
  },
  {
    name: 'carrot',
    density: 125,             // 1 cup chopped = ~125g
    countEquivalent: 80,      // 1 medium carrot = ~80g
    defaultUnit: 'whole',
    variants: ['chopped carrot', 'diced carrot', 'sliced carrot', 'grated carrot', 'shredded carrot'],
    category: 'produce'
  },
  {
    name: 'tomato',
    density: 180,             // 1 cup chopped = ~180g
    countEquivalent: 125,     // 1 medium tomato = ~125g
    defaultUnit: 'whole',
    variants: ['chopped tomato', 'diced tomato', 'sliced tomato', 'roma tomato', 'plum tomato'],
    category: 'produce'
  },
  {
    name: 'potato',
    density: 160,             // 1 cup diced = ~160g
    countEquivalent: 200,     // 1 medium potato = ~200g
    defaultUnit: 'whole',
    variants: ['russet potato', 'white potato', 'yellow potato', 'diced potato', 'chopped potato'],
    category: 'produce'
  },
  {
    name: 'flour',
    density: 120,             // 1 cup = ~120g
    defaultUnit: 'g',
    variants: ['all-purpose flour', 'white flour', 'ap flour'],
    category: 'baking'
  },
  {
    name: 'sugar',
    density: 200,             // 1 cup = ~200g
    defaultUnit: 'g',
    variants: ['granulated sugar', 'white sugar'],
    category: 'baking'
  },
  {
    name: 'jalapeno pepper',
    density: 90,              // 1 cup chopped = ~90g
    countEquivalent: 15,      // 1 medium jalapeno = ~15g
    defaultUnit: 'whole',
    variants: ['jalapeno', 'chopped jalapeno', 'diced jalapeno', 'sliced jalapeno'],
    category: 'produce'
  },
  {
    name: 'lemon',
    density: 240,             // 1 cup juice = ~240g
    countEquivalent: 100,     // 1 medium lemon = ~100g (yields ~2-3 tbsp juice)
    defaultUnit: 'whole',
    variants: ['lemon juice', 'fresh lemon', 'juice of lemon', 'lemon zest'],
    category: 'produce'
  },
  {
    name: 'lime',
    density: 240,             // 1 cup juice = ~240g
    countEquivalent: 60,      // 1 medium lime = ~60g (yields ~1-2 tbsp juice)
    defaultUnit: 'whole',
    variants: ['lime juice', 'fresh lime', 'juice of lime', 'lime zest'],
    category: 'produce'
  }
];

// Common cooking measurement conversions
const volumeConversions: Record<string, number> = {
  'tsp': 1/48,      // 1 tsp = 1/48 cup
  'teaspoon': 1/48,
  'tbsp': 1/16,     // 1 tbsp = 1/16 cup
  'tablespoon': 1/16,
  'fl oz': 1/8,     // 1 fl oz = 1/8 cup
  'fluid ounce': 1/8,
  'cup': 1,
  'cups': 1,
  'pint': 2,        // 1 pint = 2 cups
  'quart': 4,       // 1 quart = 4 cups
  'gallon': 16      // 1 gallon = 16 cups
};

/**
 * Find the standardized ingredient information based on the name
 * @param ingredientName The ingredient name to standardize
 * @returns The matching ingredient conversion data or undefined if no match
 */
export const findIngredientConversion = (ingredientName: string): IngredientConversion | undefined => {
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // First try exact match
  const exactMatch = ingredientConversions.find(ing => 
    ing.name === normalizedName ||
    ing.variants.includes(normalizedName)
  );
  
  if (exactMatch) return exactMatch;
  
  // Try partial match
  return ingredientConversions.find(ing => {
    if (normalizedName.includes(ing.name)) return true;
    return ing.variants.some(variant => normalizedName.includes(variant));
  });
};

/**
 * Convert a volume measurement to cups
 * @param quantity The quantity
 * @param unit The unit (tsp, tbsp, cup, etc.)
 * @returns The equivalent in cups
 */
export const convertToCups = (quantity: number, unit: string | null): number => {
  if (!unit) return quantity; // Assume cups if no unit provided
  
  const normalizedUnit = unit.toLowerCase().trim();
  const conversion = volumeConversions[normalizedUnit];
  
  if (!conversion) return quantity; // If unit not recognized, return as is
  
  return quantity * conversion;
};

/**
 * Standardize an ingredient for grocery shopping, converting from volume to count if applicable
 * @param ingredient The recipe ingredient
 * @returns A standardized shopping item with the correct quantity and unit
 */
export const standardizeGroceryItem = (ingredient: Ingredient): {
  name: string;
  quantity: number;
  unit: string;
} => {
  // Extract the base name and remove common modifiers
  const normalizedName = ingredient.name.toLowerCase().trim();
  
  // Get ingredient conversion data
  const conversionData = findIngredientConversion(normalizedName);
  
  if (!conversionData) {
    // If no conversion data, return the ingredient as is
    return {
      name: ingredient.name,
      quantity: typeof ingredient.quantity === 'string' 
        ? parseFloat(ingredient.quantity) || 1 
        : ingredient.quantity,
      unit: ingredient.unit || 'item'
    };
  }
  
  // Convert the ingredient quantity to a number if it's a string
  let quantity: number;
  if (typeof ingredient.quantity === 'string') {
    const parsedQuantity = parseFloat(ingredient.quantity);
    quantity = isNaN(parsedQuantity) ? 1 : parsedQuantity;
  } else {
    quantity = ingredient.quantity;
  }
  
  // Step 1: Convert to cups if the unit is volume-based
  if (ingredient.unit) {
    quantity = convertToCups(quantity, ingredient.unit);
  }
  
  // Step 2: Convert from cups to weight in grams
  const weightInGrams = quantity * conversionData.density;
  
  // Step 3: If the ingredient can be counted, convert from weight to count
  if (conversionData.countEquivalent) {
    // Calculate how many whole items needed
    const countNeeded = weightInGrams / conversionData.countEquivalent;
    
    // Round up to the nearest whole item
    const roundedCount = Math.ceil(countNeeded);
    
    return {
      name: conversionData.name,
      quantity: roundedCount,
      unit: conversionData.defaultUnit
    };
  }
  
  // For non-countable items, return in the default unit
  return {
    name: conversionData.name,
    quantity: Math.ceil(weightInGrams), // Round up to the nearest gram
    unit: conversionData.defaultUnit
  };
};

/**
 * Process multiple recipe ingredients into standardized grocery items,
 * combining duplicates and converting to appropriate units
 * @param ingredients Array of recipe ingredients
 * @returns Array of standardized grocery items ready for shopping
 */
export const processIngredientsForGrocery = (ingredients: Ingredient[]): {
  name: string;
  quantity: number;
  unit: string;
}[] => {
  // Standardize each ingredient
  const standardizedItems = ingredients.map(standardizeGroceryItem);
  
  // Group by name to combine duplicates
  const groupedItems: Record<string, {
    name: string;
    quantity: number;
    unit: string;
  }> = {};
  
  standardizedItems.forEach(item => {
    const key = `${item.name}-${item.unit}`;
    
    if (groupedItems[key]) {
      // If item already exists, add quantities
      groupedItems[key].quantity += item.quantity;
    } else {
      // Otherwise, add new item
      groupedItems[key] = { ...item };
    }
  });
  
  // Convert grouped items back to array
  return Object.values(groupedItems);
}; 