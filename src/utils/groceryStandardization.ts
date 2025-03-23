import { Ingredient } from '../types';

/**
 * Mini database of ingredient conversions - structured to match industry food databases
 * For each ingredient we track:
 * - name: the standardized name for consistent shopping list entries
 * - density: weight in grams per cup, used for volume-to-weight conversions
 * - countEquivalent: weight in grams of one whole item (if applicable)
 * - defaultUnit: preferred unit for shopping list display
 * - variants: alternative names and forms for matching ingredients
 * - category: food category for organization
 * - isPrecise: indicates ingredients requiring exact measurements (e.g. baking ingredients)
 * - preferCount: indicates ingredients better tracked by count (e.g. whole produce)
 * - commonForms: list of preparation forms (e.g. chopped, diced) for smart matching
 * 
 * The system handles three main types of conversions:
 * 1. Weight-based: Used for precise ingredients (e.g. flour) - always converts to grams
 * 2. Count-based: Used for whole items (e.g. produce) - converts to number of items
 * 3. Volume-based: Converts to weight or count based on ingredient context
 * 
 * Conversion logic prioritizes:
 * - Precise measurements for baking ingredients
 * - Whole counts for produce when possible
 * - Original units when no specific conversion is needed
 */
interface IngredientConversion {
  name: string;                 // Standardized name for shopping
  density: number;              // Grams per cup
  countEquivalent?: number;     // Grams per whole item (if applicable)
  defaultUnit: string;          // Standard unit for shopping
  variants: string[];           // Alternative names to match
  category: string;             // Category for organization
  isPrecise?: boolean;         // Is this ingredient used in precise measurements?
  preferCount?: boolean;       // Always prefer count when possible?
  commonForms?: string[];      // e.g. ['whole', 'chopped', 'diced']
}

// Mini database of common ingredients with volume-to-weight-to-count conversions
const ingredientConversions: IngredientConversion[] = [
  {
    name: 'bell pepper',
    density: 150,             // 1 cup chopped = ~150g
    countEquivalent: 150,     // 1 medium bell pepper = ~150g
    defaultUnit: 'whole',
    variants: ['red bell pepper', 'green bell pepper', 'yellow bell pepper', 'orange bell pepper', 'sweet pepper', 'chopped bell pepper', 'diced bell pepper', 'sliced bell pepper'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'chopped', 'diced', 'sliced']
  },
  {
    name: 'onion',
    density: 160,             // 1 cup chopped = ~160g
    countEquivalent: 180,     // 1 medium onion = ~180g
    defaultUnit: 'whole',
    variants: ['yellow onion', 'white onion', 'red onion', 'chopped onion', 'diced onion', 'sliced onion'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'chopped', 'diced', 'sliced']
  },
  {
    name: 'garlic',
    density: 150,             // 1 cup = ~150g
    countEquivalent: 5,       // 1 clove = ~5g
    defaultUnit: 'clove',
    variants: ['minced garlic', 'chopped garlic', 'crushed garlic', 'garlic clove', 'garlic cloves'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'minced', 'chopped', 'crushed']
  },
  {
    name: 'carrot',
    density: 125,             // 1 cup chopped = ~125g
    countEquivalent: 80,      // 1 medium carrot = ~80g
    defaultUnit: 'whole',
    variants: ['chopped carrot', 'diced carrot', 'sliced carrot', 'grated carrot', 'shredded carrot'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'chopped', 'diced', 'sliced', 'grated']
  },
  {
    name: 'tomato',
    density: 180,             // 1 cup chopped = ~180g
    countEquivalent: 125,     // 1 medium tomato = ~125g
    defaultUnit: 'whole',
    variants: ['chopped tomato', 'diced tomato', 'sliced tomato', 'roma tomato', 'plum tomato'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'chopped', 'diced', 'sliced']
  },
  {
    name: 'potato',
    density: 160,             // 1 cup diced = ~160g
    countEquivalent: 200,     // 1 medium potato = ~200g
    defaultUnit: 'whole',
    variants: ['russet potato', 'white potato', 'yellow potato', 'diced potato', 'chopped potato'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'diced', 'chopped']
  },
  {
    name: 'plain flour',
    density: 120,             // 1 cup = ~120g
    defaultUnit: 'g',
    variants: ['all-purpose flour', 'white flour', 'ap flour'],
    category: 'baking',
    isPrecise: true
  },
  {
    name: 'sugar',
    density: 200,             // 1 cup = ~200g
    defaultUnit: 'g',
    variants: ['granulated sugar', 'white sugar'],
    category: 'baking',
    isPrecise: true
  },
  {
    name: 'jalapeno pepper',
    density: 90,              // 1 cup chopped = ~90g
    countEquivalent: 15,      // 1 medium jalapeno = ~15g
    defaultUnit: 'whole',
    variants: ['jalapeno', 'chopped jalapeno', 'diced jalapeno', 'sliced jalapeno'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'chopped', 'diced', 'sliced']
  },
  {
    name: 'lemon',
    density: 240,             // 1 cup juice = ~240g
    countEquivalent: 100,     // 1 medium lemon = ~100g (yields ~2-3 tbsp juice)
    defaultUnit: 'whole',
    variants: ['lemon juice', 'fresh lemon', 'juice of lemon', 'lemon zest'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'juiced', 'zested']
  },
  {
    name: 'lime',
    density: 240,             // 1 cup juice = ~240g
    countEquivalent: 60,      // 1 medium lime = ~60g (yields ~1-2 tbsp juice)
    defaultUnit: 'whole',
    variants: ['lime juice', 'fresh lime', 'juice of lime', 'lime zest'],
    category: 'produce',
    preferCount: true,
    commonForms: ['whole', 'juiced', 'zested']
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
  
  // Only do exact matches against name or variants
  return ingredientConversions.find(ing => 
    ing.name === normalizedName ||
    ing.variants.includes(normalizedName)
  );
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

  // If the ingredient requires precise measurements (like flour), always convert to weight
  if (conversionData.isPrecise) {
    // If already in grams, return as is
    if (ingredient.unit === 'g' || ingredient.unit === 'grams') {
      return {
        name: conversionData.name,
        quantity: quantity,
        unit: 'g'
      };
    }
    
    // Convert to cups first if it's a volume measurement
    if (ingredient.unit && ingredient.unit in volumeConversions) {
      quantity = convertToCups(quantity, ingredient.unit);
    }
    
    // Convert to grams using density
    return {
      name: conversionData.name,
      quantity: Math.ceil(quantity * conversionData.density),
      unit: 'g'
    };
  }

  // If we prefer counting this ingredient and it has a count equivalent
  if (conversionData.preferCount && conversionData.countEquivalent) {
    let weightInGrams = quantity;
    
    // If it's a volume measurement, convert to grams first
    if (ingredient.unit && ingredient.unit in volumeConversions) {
      const cups = convertToCups(quantity, ingredient.unit);
      weightInGrams = cups * conversionData.density;
    }
    // If it's already in grams, use it directly
    else if (ingredient.unit === 'g' || ingredient.unit === 'grams') {
      weightInGrams = quantity;
    }
    
    // Convert to count
    const countNeeded = weightInGrams / conversionData.countEquivalent;
    return {
      name: conversionData.name,
      quantity: Math.ceil(countNeeded),
      unit: conversionData.defaultUnit
    };
  }

  // For all other cases, maintain the original unit if possible
  // or convert to a sensible default using the standard conversion
  if (ingredient.unit && ingredient.unit in volumeConversions) {
    quantity = convertToCups(quantity, ingredient.unit);
    return {
      name: conversionData.name,
      quantity: Math.ceil(quantity * conversionData.density),
      unit: conversionData.defaultUnit
    };
  }

  // If no specific conversion needed, return with standardized name
  return {
    name: conversionData.name,
    quantity: Math.ceil(quantity),
    unit: ingredient.unit || conversionData.defaultUnit
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