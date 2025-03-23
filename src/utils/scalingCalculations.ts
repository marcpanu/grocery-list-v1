import { Recipe } from '../types/recipe';
import { Meal, Week } from '../types/mealPlan';

/**
 * Calculate the scaling factor for a recipe based on desired servings
 */
export function calculateScalingFactor(
  desiredServings: number,
  baseServings: number,
  isScalable: boolean
): number {
  console.log(`Calculating scaling factor:
    - Desired servings: ${desiredServings}
    - Base servings: ${baseServings}
    - Is scalable: ${isScalable}`);

  const factor = desiredServings / baseServings;
  const finalFactor = isScalable ? factor : Math.ceil(factor);

  console.log(`Scaling calculation:
    - Raw factor: ${factor}
    - Final factor (${isScalable ? 'decimal' : 'rounded up'}): ${finalFactor}`);

  return finalFactor;
}

/**
 * Update scaling factors and total servings for a week
 */
export async function updateWeekScalingFactors(
  week: Week,
  meals: Meal[],
  recipes: { [recipeId: string]: Recipe }
): Promise<{ scalingFactors: Week['scalingFactors'], totalServings: Week['totalServings'] }> {
  const scalingFactors: { [recipeId: string]: number } = {};
  const totalServings: { [recipeId: string]: number } = {};

  console.log(`Updating week scaling factors for week ${week.id}:
    - Number of meals: ${meals.length}
    - Number of recipes: ${Object.keys(recipes).length}`);

  // Group meals by recipeId
  const mealsByRecipe = meals.reduce((acc, meal) => {
    if (meal.recipeId) {
      if (!acc[meal.recipeId]) {
        acc[meal.recipeId] = [];
      }
      acc[meal.recipeId].push(meal);
    }
    return acc;
  }, {} as { [recipeId: string]: Meal[] });

  // Calculate scaling factors and total servings for each recipe
  for (const [recipeId, recipeMeals] of Object.entries(mealsByRecipe)) {
    const recipe = recipes[recipeId];
    if (!recipe) {
      console.warn(`Recipe ${recipeId} not found, skipping scaling calculations`);
      continue;
    }

    console.log(`Processing recipe ${recipe.name} (${recipeId}):
      - Base servings: ${recipe.servings}
      - Is scalable: ${recipe.isScalable ?? false}
      - Number of meals using this recipe: ${recipeMeals.length}`);

    // Calculate total desired servings for this recipe
    const totalDesiredServings = recipeMeals.reduce((sum, meal) => sum + meal.servings, 0);
    
    // Calculate scaling factor
    const scalingFactor = calculateScalingFactor(
      totalDesiredServings,
      recipe.servings,
      recipe.isScalable ?? false
    );

    scalingFactors[recipeId] = scalingFactor;
    totalServings[recipeId] = totalDesiredServings;

    console.log(`Final calculations for recipe ${recipe.name}:
      - Total desired servings: ${totalDesiredServings}
      - Scaling factor: ${scalingFactor}`);
  }

  return { scalingFactors, totalServings };
}

/**
 * Scale an ingredient quantity based on the scaling factor
 */
export function scaleQuantity(
  quantity: string | number,
  scalingFactor: number
): string | number {
  console.log(`Scaling quantity:
    - Original quantity: ${quantity}
    - Scaling factor: ${scalingFactor}`);

  if (typeof quantity === 'number') {
    const scaled = quantity * scalingFactor;
    console.log(`- Scaled quantity (number): ${scaled}`);
    return scaled;
  }

  // Try to parse the string as a number
  const numericQuantity = parseFloat(quantity);
  if (!isNaN(numericQuantity)) {
    const scaled = numericQuantity * scalingFactor;
    console.log(`- Scaled quantity (parsed number): ${scaled}`);
    return scaled.toString();
  }

  // If we can't parse it, return the original quantity
  console.log('- Could not scale quantity, returning original');
  return quantity;
} 