import { Category } from '../types';

/**
 * Find the most likely category for an ingredient
 * @param ingredientName The ingredient name
 * @param userCategories The list of user-defined categories
 * @returns The most appropriate category or undefined if no match
 */
export const categorizeIngredient = (
  ingredientName: string,
  userCategories: Category[]
): Category | undefined => {
  console.log("categorizeIngredient called with:", ingredientName);
  console.log("Available categories:", JSON.stringify(userCategories, null, 2));

  if (!userCategories || userCategories.length === 0) {
    console.log("No user categories available for categorization");
    return undefined;
  }

  // Find the "Other" category - we'll use this as a fallback
  const otherCategory = userCategories.find(c => 
    c.name.toLowerCase() === 'other' || 
    c.name.toLowerCase().includes('other')
  );

  // Common category mappings for grocery items - expanded with more specific items
  const commonMappings: Record<string, string[]> = {
    produce: [
      'vegetable', 'fruit', 'fresh', 'produce', 'pepper', 'tomato', 'onion', 
      'lettuce', 'cucumber', 'carrot', 'potato', 'apple', 'banana', 'orange', 
      'lemon', 'lime', 'herb', 'basil', 'cilantro', 'parsley', 'mint', 'garlic',
      'shoots', 'sprouts', 'greens', 'kale', 'spinach', 'berries', 'avocado',
      'ginger', 'mushroom', 'eggplant', 'zucchini', 'squash', 'cabbage', 'celery'
    ],
    dairy: [
      'milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'dairy',
      'yogurt', 'yoghurt', 'creamer', 'buttermilk', 'curd', 'sour cream', 'whipping cream',
      'pecorino', 'parmesan', 'romano', 'mozzarella', 'cheddar', 'feta', 'gouda',
      'brie', 'ricotta', 'cottage cheese', 'blue cheese', 'provolone', 'monterey jack',
      'swiss cheese', 'cream cheese', 'goat cheese', 'mascarpone', 'havarti'
    ],
    meat: [
      'chicken', 'beef', 'pork', 'turkey', 'lamb', 'meat', 'steak', 'drumstick',
      'thigh', 'breast', 'wing', 'ground', 'mince', 'sausage', 'bacon', 'ham',
      'seafood', 'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'tilapia',
      'cod', 'egg', 'eggs', 'oxtail', 'pancetta', 'guanciale', 'prosciutto',
      'salami', 'pepperoni', 'chorizo', 'duck', 'veal', 'liver', 'tripe', 'tongue',
      'brisket', 'ribs', 'chop', 'roast', 'fillet', 'venison', 'rabbit'
    ],
    bakery: [
      'bread', 'roll', 'bagel', 'pastry', 'baked', 'dough', 'cake', 'cookie',
      'muffin', 'pie', 'bun', 'croissant', 'loaf', 'toast', 'baguette'
    ],
    packaged: [
      'canned', 'jar', 'dried', 'pasta', 'rice', 'bean', 'lentil', 'grain', 'cereal', 
      'flour', 'sugar', 'oil', 'vinegar', 'sauce', 'condiment', 'packet', 'box',
      'noodle', 'mix', 'soup', 'broth', 'stock', 'coconut milk', 'coconut cream',
      'canned tomato', 'canned bean', 'chips', 'crackers', 'snack', 'packaged',
      'bamboo shoots', 'water chestnut', 'heart of palm', 'artichoke heart',
      'spaghetti', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'macaroni',
      'lasagna', 'orzo', 'couscous', 'quinoa', 'barley', 'oats', 'tortilla',
      'wrap', 'pita', 'can', 'boxed', 'bottled', 'tuna', 'sardines', 'anchovies'
    ],
    spices: [
      'spice', 'seasoning', 'herb', 'powder', 'salt', 'pepper', 'curry', 'cumin',
      'cinnamon', 'nutmeg', 'paprika', 'oregano', 'basil', 'thyme', 'rosemary',
      'chili', 'garlic powder', 'onion powder', 'ginger powder', 'bay leaf',
      'marinade', 'rub', 'extract', 'vanilla', 'seasoning', 'chile', 'cajun',
      'five spice', 'za\'atar', 'curry paste', 'herb', 'masala', 'cardamom',
      'star anise', 'turmeric', 'saffron', 'mustard', 'horseradish'
    ],
    sauces: [
      'sauce', 'ketchup', 'mustard', 'mayonnaise', 'dressing', 'vinaigrette',
      'soy sauce', 'hot sauce', 'sriracha', 'hoisin', 'fish sauce', 'oyster sauce',
      'barbecue', 'bbq', 'teriyaki', 'worcestershire', 'chili sauce', 'tabasco',
      'aioli', 'salsa', 'hummus', 'tahini', 'pesto', 'relish', 'maple syrup'
    ],
    frozen: [
      'frozen', 'ice', 'popsicle', 'ice cream', 'sorbet', 'gelato', 'frozen yogurt',
      'frozen dinner', 'frozen pizza', 'frozen vegetables', 'frozen fruit'
    ],
    snacks: [
      'chip', 'cracker', 'snack', 'nut', 'candy', 'chocolate', 'popcorn', 'pretzel',
      'granola', 'energy bar', 'protein bar', 'trail mix', 'dried fruit', 'jerky'
    ],
    beverages: [
      'drink', 'juice', 'water', 'soda', 'coffee', 'tea', 'beer', 'wine', 'alcohol',
      'liquor', 'whiskey', 'vodka', 'rum', 'tequila', 'cocktail', 'cider', 'kombucha',
      'mineral water', 'sparkling water', 'soft drink', 'energy drink', 'milk', 'smoothie'
    ]
  };

  // Normalize the ingredient name
  const normalizedName = ingredientName.trim().toLowerCase();
  
  // Log all category IDs and names for debugging
  const categoryMap = userCategories.map(c => `ID: ${c.id}, Name: ${c.name}`);
  console.log("Category IDs and Names:", categoryMap);
  
  // Try an exact match first
  for (const category of userCategories) {
    if (normalizedName === category.name.toLowerCase()) {
      console.log("Exact category match found:", category.name);
      return category;
    }
  }
  
  // Check for exact matches to specific items first
  // These are high-confidence, specific matches that override the general mappings
  const exactMatches: Record<string, string> = {
    // Pasta & Grains
    'spaghetti': 'packaged',
    'pasta': 'packaged',
    'fettuccine': 'packaged',
    'linguine': 'packaged',
    'penne': 'packaged',
    'rigatoni': 'packaged',
    'lasagna': 'packaged',
    'macaroni': 'packaged',
    'orzo': 'packaged',
    'noodles': 'packaged',
    
    // Dairy & Related
    'coconut milk': 'packaged',
    'coconut cream': 'packaged',
    'pecorino': 'dairy',
    'pecorino romano': 'dairy',
    'parmesan': 'dairy',
    'cheese': 'dairy',
    'cheddar': 'dairy',
    'mozzarella': 'dairy',
    'feta': 'dairy',
    'gouda': 'dairy',
    'brie': 'dairy',
    'goat cheese': 'dairy',
    'cream cheese': 'dairy',
    'ricotta': 'dairy',
    'romano': 'dairy',
    
    // Spices & Condiments
    'curry paste': 'spices',
    'green curry paste': 'spices',
    'red curry paste': 'spices',
    'yellow curry paste': 'spices',
    'palm sugar': 'spices',
    'brown sugar': 'spices',
    'granulated sugar': 'spices',
    
    // Sauces
    'fish sauce': 'sauces',
    'soy sauce': 'sauces',
    'hoisin sauce': 'sauces',
    'oyster sauce': 'sauces',
    
    // Canned/Packaged
    'bamboo shoots': 'packaged',
    'water chestnuts': 'packaged',
    
    // Meats
    'oxtail': 'meat',
    'oxtails': 'meat',
    'pancetta': 'meat',
    'guanciale': 'meat',
    'bacon': 'meat',
    'prosciutto': 'meat',
    'salami': 'meat'
  };
  
  // Check for exact matches in our override list
  for (const [itemName, categoryType] of Object.entries(exactMatches)) {
    if (normalizedName === itemName || normalizedName.includes(itemName)) {
      // Find matching category in user categories
      const matchingCategoryMap: Record<string, string[]> = {
        'packaged': ['packaged', 'package', 'pack', 'pantry', 'goods', 'canned'],
        'spices': ['spice', 'season', 'spices', 'seasoning', 'spices and seasonings'],
        'sauces': ['sauce', 'condiment', 'dressing', 'seasoning', 'spice', 'spices'],
        'produce': ['produce', 'vegetable', 'fruit', 'fresh'],
        'meat': ['meat', 'protein', 'seafood', 'poultry', 'fish', 'beef', 'chicken', 'eggs'],
        'dairy': ['dairy', 'milk', 'cheese', 'yogurt']
      };
      
      // Get the list of terms to match against categories
      const matchTerms = matchingCategoryMap[categoryType] || [categoryType];
      
      // Find a matching category
      for (const matchTerm of matchTerms) {
        const matchingCategory = userCategories.find(c => 
          c.name.toLowerCase().includes(matchTerm)
        );
        
        if (matchingCategory) {
          console.log(`Exact match: ${ingredientName} to ${matchingCategory.name} via override mapping`);
          return matchingCategory;
        }
      }
    }
  }

  // Try to match against common mappings
  for (const [categoryType, keywordList] of Object.entries(commonMappings)) {
    for (const keyword of keywordList) {
      if (normalizedName.includes(keyword)) {
        // Find a matching category in user categories
        const matchingCategoryMap: Record<string, string[]> = {
          'produce': ['produce', 'vegetable', 'fruit', 'fresh'],
          'dairy': ['dairy', 'milk', 'cheese', 'yogurt'],
          'meat': ['meat', 'protein', 'seafood', 'poultry', 'fish', 'beef', 'chicken', 'eggs'],
          'bakery': ['bakery', 'bread', 'baked'],
          'packaged': ['packaged', 'package', 'pack', 'pantry', 'goods', 'canned'],
          'spices': ['spice', 'season', 'spices', 'seasoning', 'spices and seasonings'],
          'sauces': ['sauce', 'condiment', 'dressing', 'seasoning', 'spice', 'spices'],
          'frozen': ['frozen', 'freezer', 'cold'],
          'snacks': ['snack', 'chip', 'cracker', 'nut'],
          'beverages': ['beverage', 'drink', 'water', 'juice', 'soda']
        };
        
        // Get the list of terms to match against categories
        const matchTerms = matchingCategoryMap[categoryType] || [categoryType];
        
        // Find a matching category
        for (const matchTerm of matchTerms) {
          const matchingCategory = userCategories.find(c => 
            c.name.toLowerCase().includes(matchTerm)
          );
          
          if (matchingCategory) {
            console.log(`Matched ${ingredientName} to ${matchingCategory.name} via keyword '${keyword}'`);
            return matchingCategory;
          }
        }
      }
    }
  }
  
  // Try a more flexible substring match
  for (const category of userCategories) {
    const categoryLower = category.name.toLowerCase();
    if (normalizedName.includes(categoryLower) || categoryLower.includes(normalizedName)) {
      console.log("Substring category match found:", category.name);
      return category;
    }
  }
  
  // If no match yet, try with each word in the ingredient name
  const words = normalizedName.split(/\s+/);
  for (const word of words) {
    if (word.length < 3) continue; // Skip short words
    
    for (const category of userCategories) {
      if (category.name.toLowerCase().includes(word)) {
        console.log("Word match found:", word, "in category", category.name);
        return category;
      }
    }
  }
  
  // Try one more approach - see if any category name matches a word in the ingredient
  for (const category of userCategories) {
    const categoryWords = category.name.toLowerCase().split(/\s+/);
    for (const categoryWord of categoryWords) {
      if (categoryWord.length < 3) continue; // Skip short words
      if (normalizedName.includes(categoryWord)) {
        console.log("Category word match found:", categoryWord, "in ingredient", normalizedName);
        return category;
      }
    }
  }
  
  console.log("No category match found for:", ingredientName);
  
  // If we get here, we didn't find any category match
  // Return the "Other" category as a fallback if it exists
  if (otherCategory) {
    console.log(`Using fallback "Other" category for: ${ingredientName}`);
    return otherCategory;
  }
  
  // If no "Other" category exists, we have to return undefined
  return undefined;
};

/**
 * Standardize an ingredient quantity and unit for shopping
 * @param quantity The ingredient quantity
 * @param unit The ingredient unit or null
 * @param ingredientName The ingredient name for lookup
 * @returns Standardized quantity and unit
 */
export const standardizeIngredient = (
  quantity: number,
  unit: string | null,
  ingredientName: string
): { quantity: number; unit: string; name: string } => {
  console.log("standardizeIngredient called for:", ingredientName, quantity, unit);
  
  // Remove common modifiers from ingredient name
  const modifiers = ['chopped', 'diced', 'sliced', 'minced', 'grated', 'fresh', 'frozen', 'canned', 'dried'];
  let standardizedName = ingredientName.toLowerCase();
  modifiers.forEach(modifier => {
    standardizedName = standardizedName.replace(new RegExp(`\\b${modifier}\\b\\s*`, 'i'), '');
  });
  standardizedName = standardizedName.trim();

  // Handle volume to count conversions for common produce
  const volumeToCount: Record<string, { count: number; unit: string }> = {
    'bell pepper': { count: 1, unit: 'item' },
    'onion': { count: 1, unit: 'item' },
    'tomato': { count: 1, unit: 'item' },
    'carrot': { count: 1, unit: 'item' },
    'potato': { count: 1, unit: 'item' },
    'apple': { count: 1, unit: 'item' },
    'orange': { count: 1, unit: 'item' },
    'lemon': { count: 1, unit: 'item' },
    'lime': { count: 1, unit: 'item' },
    'garlic': { count: 1, unit: 'item' },
    'ginger': { count: 1, unit: 'item' },
    'cucumber': { count: 1, unit: 'item' },
    'zucchini': { count: 1, unit: 'item' },
    'eggplant': { count: 1, unit: 'item' },
    'avocado': { count: 1, unit: 'item' },
    'mushroom': { count: 1, unit: 'item' },
    'celery': { count: 1, unit: 'item' },
    'lettuce': { count: 1, unit: 'item' },
    'cabbage': { count: 1, unit: 'item' },
    'cauliflower': { count: 1, unit: 'item' },
    'broccoli': { count: 1, unit: 'item' },
    'asparagus': { count: 1, unit: 'item' },
    'corn': { count: 1, unit: 'item' }
  };

  // Check if this is a volume-based ingredient that should be converted to count
  for (const [baseName, conversion] of Object.entries(volumeToCount)) {
    if (standardizedName.includes(baseName)) {
      return {
        quantity: Math.ceil(quantity),
        unit: conversion.unit,
        name: baseName
      };
    }
  }

  // If no conversion found, return original values
  return {
    quantity: Math.ceil(quantity),
    unit: unit || 'item',
    name: standardizedName
  };
};

/**
 * Combine multiple ingredient entries into a single standardized entry
 * @param ingredients Array of ingredients with same name but different quantities/units
 * @returns A combined ingredient with standardized quantity
 */
export const combineIngredients = (
  ingredients: Array<{ 
    quantity: number; 
    unit: string | null; 
    name: string;
  }>
): { quantity: number; unit: string; name: string } => {
  console.log("combineIngredients called with:", ingredients);
  
  if (ingredients.length === 0) {
    throw new Error('No ingredients to combine');
  }

  // Get the first ingredient as base
  const firstIngredient = ingredients[0];
  const baseName = firstIngredient.name.toLowerCase();
  
  // Remove common modifiers from ingredient name
  const modifiers = ['chopped', 'diced', 'sliced', 'minced', 'grated', 'fresh', 'frozen', 'canned', 'dried'];
  let standardizedName = baseName;
  modifiers.forEach(modifier => {
    standardizedName = standardizedName.replace(new RegExp(`\\b${modifier}\\b\\s*`, 'i'), '');
  });
  standardizedName = standardizedName.trim();

  // Check if ingredients are color variations of the same base ingredient
  const colorVariations: Record<string, string[]> = {
    'bell pepper': ['green bell pepper', 'red bell pepper', 'yellow bell pepper', 'orange bell pepper', 'chopped bell pepper', 'diced bell pepper', 'sliced bell pepper'],
    'onion': ['red onion', 'yellow onion', 'white onion', 'sweet onion', 'shallot', 'chopped onion', 'diced onion', 'sliced onion'],
    'tomato': ['red tomato', 'green tomato', 'yellow tomato', 'cherry tomato', 'roma tomato', 'chopped tomato', 'diced tomato', 'sliced tomato'],
    'apple': ['red apple', 'green apple', 'yellow apple', 'pink apple', 'chopped apple', 'diced apple', 'sliced apple'],
    'potato': ['red potato', 'white potato', 'yellow potato', 'russet potato', 'sweet potato', 'chopped potato', 'diced potato', 'sliced potato'],
    'carrot': ['orange carrot', 'purple carrot', 'yellow carrot', 'white carrot', 'chopped carrot', 'diced carrot', 'sliced carrot'],
    'cabbage': ['green cabbage', 'red cabbage', 'savoy cabbage', 'napa cabbage', 'chopped cabbage', 'diced cabbage', 'sliced cabbage'],
    'lettuce': ['iceberg lettuce', 'romaine lettuce', 'butter lettuce', 'red leaf lettuce', 'green leaf lettuce', 'chopped lettuce', 'diced lettuce', 'sliced lettuce'],
    'grape': ['red grape', 'green grape', 'black grape', 'purple grape', 'chopped grape', 'diced grape', 'sliced grape'],
    'pepper': ['green pepper', 'red pepper', 'yellow pepper', 'orange pepper', 'chopped pepper', 'diced pepper', 'sliced pepper'],
    'chili': ['green chili', 'red chili', 'yellow chili', 'orange chili', 'chopped chili', 'diced chili', 'sliced chili']
  };

  // Find the base ingredient name if this is a color variation
  let baseIngredientName = standardizedName;
  for (const [base, variations] of Object.entries(colorVariations)) {
    if (variations.includes(standardizedName)) {
      baseIngredientName = base;
      break;
    }
  }

  // Sum up quantities
  const totalQuantity = ingredients.reduce((sum, ing) => sum + ing.quantity, 0);

  // Standardize the ingredient
  const standardized = standardizeIngredient(totalQuantity, firstIngredient.unit, baseIngredientName);

  return {
    quantity: standardized.quantity,
    unit: standardized.unit,
    name: standardized.name
  };
}; 