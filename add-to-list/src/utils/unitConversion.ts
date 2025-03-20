// Base unit conversions
export const UNIT_CONVERSIONS = {
  // Volume conversions (to mL)
  volume: {
    ml: 1,
    l: 1000,
    cups: 236.588,
    fl_oz: 29.5735,
    tbsp: 14.7868,
    tsp: 4.92892
  },
  
  // Mass conversions (to g)
  mass: {
    g: 1,
    kg: 1000,
    lb: 453.592,
    oz: 28.3495
  }
} as const;

// Common ingredient densities (g/mL)
export const INGREDIENT_DENSITIES: Record<string, {
  density: number;  // g/mL
  standardUnit: string;
  standardSize: number;  // in grams
}> = {
  // Vegetables
  'bell pepper': {
    density: 0.45,
    standardUnit: 'whole',
    standardSize: 160
  },
  'onion': {
    density: 0.74,
    standardUnit: 'whole',
    standardSize: 150
  },
  'carrot': {
    density: 0.64,
    standardUnit: 'whole',
    standardSize: 128
  },
  
  // Pantry Items
  'flour': {
    density: 0.593,
    standardUnit: 'g',
    standardSize: 1
  },
  'sugar': {
    density: 0.845,
    standardUnit: 'g',
    standardSize: 1
  },
  'rice': {
    density: 0.75,
    standardUnit: 'g',
    standardSize: 1
  },
  
  // Dairy
  'milk': {
    density: 1.03,
    standardUnit: 'ml',
    standardSize: 1
  },
  'heavy cream': {
    density: 0.994,
    standardUnit: 'ml',
    standardSize: 1
  },
  
  // Proteins
  'chicken breast': {
    density: 1.06,
    standardUnit: 'whole',
    standardSize: 227
  },
  'ground beef': {
    density: 1.02,
    standardUnit: 'g',
    standardSize: 1
  }
};

/**
 * Convert a quantity from one unit to another
 */
export function convertUnits(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  type: 'volume' | 'mass'
): number {
  // Get conversion factors
  const fromFactor = UNIT_CONVERSIONS[type][fromUnit as keyof typeof UNIT_CONVERSIONS[typeof type]];
  const toFactor = UNIT_CONVERSIONS[type][toUnit as keyof typeof UNIT_CONVERSIONS[typeof type]];
  
  if (!fromFactor || !toFactor) {
    throw new Error(`Invalid unit conversion: ${fromUnit} to ${toUnit}`);
  }
  
  // Convert to base unit (mL or g) then to target unit
  return (quantity * fromFactor) / toFactor;
}

/**
 * Get the standard quantity for an ingredient
 */
export function standardizeIngredientQuantity(
  quantity: number,
  unit: string,
  ingredientName: string
): { quantity: number; unit: string; confidence: 'high' | 'medium' | 'low' } {
  // Find ingredient data
  const ingredientData = INGREDIENT_DENSITIES[ingredientName.toLowerCase()];
  if (!ingredientData) {
    return {
      quantity: Math.ceil(quantity),
      unit: unit || 'item',
      confidence: 'low'
    };
  }
  
  try {
    // Determine if input unit is volume or mass
    const unitType = UNIT_CONVERSIONS.volume[unit as keyof typeof UNIT_CONVERSIONS['volume']]
      ? 'volume'
      : UNIT_CONVERSIONS.mass[unit as keyof typeof UNIT_CONVERSIONS['mass']]
        ? 'mass'
        : null;
        
    if (!unitType) {
      return {
        quantity: Math.ceil(quantity),
        unit: unit || 'item',
        confidence: 'low'
      };
    }
    
    // Convert to grams
    let grams: number;
    if (unitType === 'mass') {
      grams = convertUnits(quantity, unit, 'g', 'mass');
    } else {
      const ml = convertUnits(quantity, unit, 'ml', 'volume');
      grams = ml * ingredientData.density;
    }
    
    // Convert to standard units
    if (ingredientData.standardUnit === 'g' || ingredientData.standardUnit === 'ml') {
      return {
        quantity: Math.ceil(grams),
        unit: ingredientData.standardUnit,
        confidence: 'high'
      };
    }
    
    // Convert to whole units
    const standardQuantity = grams / ingredientData.standardSize;
    return {
      quantity: Math.ceil(standardQuantity),
      unit: ingredientData.standardUnit,
      confidence: 'high'
    };
    
  } catch (error) {
    console.error('Error standardizing quantity:', error);
    return {
      quantity: Math.ceil(quantity),
      unit: unit || 'item',
      confidence: 'low'
    };
  }
} 