import { addRecipe } from '../firebase/firestore';
import { Recipe, PrepTime } from '../types/recipe';

const testRecipes: Omit<Recipe, 'id'>[] = [
  {
    name: 'Classic Spaghetti Carbonara',
    description: 'A traditional Roman pasta dish with eggs, cheese, pancetta, and black pepper.',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80&w=800',
    servings: 4,
    prepTime: '<30' as PrepTime,
    cookTime: '20',
    ingredients: [
      { name: 'spaghetti', quantity: 1, unit: 'pound' },
      { name: 'pancetta or guanciale', quantity: 0.5, unit: 'pound', notes: 'diced' },
      { name: 'large eggs', quantity: 4, unit: 'whole' },
      { name: 'Pecorino Romano', quantity: 1, unit: 'cup', notes: 'freshly grated' },
      { name: 'black pepper', quantity: 2, unit: 'teaspoons', notes: 'freshly ground' },
      { name: 'salt', quantity: 1, unit: 'teaspoon' }
    ],
    instructions: [
      { order: 1, instruction: 'Bring a large pot of salted water to boil' },
      { order: 2, instruction: 'Cook pancetta in a large skillet until crispy' },
      { order: 3, instruction: 'Whisk eggs, cheese, and pepper in a bowl' },
      { order: 4, instruction: 'Cook pasta until al dente, reserve 1 cup pasta water' },
      { order: 5, instruction: 'Toss hot pasta with pancetta, then quickly stir in egg mixture' }
    ],
    mealTypes: ['dinner'],
    cuisine: ['Italian'],
    isFavorite: false,
    rating: 5,
    dateAdded: new Date()
  },
  {
    name: 'Overnight Oats with Berries',
    description: 'Easy and healthy breakfast prepared the night before.',
    imageUrl: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=800',
    servings: 1,
    prepTime: '<30' as PrepTime,
    ingredients: [
      { name: 'rolled oats', quantity: 0.5, unit: 'cup' },
      { name: 'milk', quantity: 0.5, unit: 'cup', notes: 'any kind' },
      { name: 'yogurt', quantity: 0.25, unit: 'cup', notes: 'plain or vanilla' },
      { name: 'chia seeds', quantity: 1, unit: 'tablespoon' },
      { name: 'honey', quantity: 1, unit: 'tablespoon' },
      { name: 'mixed berries', quantity: 0.5, unit: 'cup', notes: 'fresh or frozen' }
    ],
    instructions: [
      { order: 1, instruction: 'Combine oats, milk, yogurt, chia seeds, and honey in a jar' },
      { order: 2, instruction: 'Stir well to combine' },
      { order: 3, instruction: 'Cover and refrigerate overnight' },
      { order: 4, instruction: 'Top with berries before serving' }
    ],
    mealTypes: ['breakfast'],
    isFavorite: true,
    notes: 'Can be stored in refrigerator for up to 3 days',
    dateAdded: new Date()
  },
  {
    name: 'Thai Green Curry',
    description: 'Fragrant and creamy coconut curry with vegetables.',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=800',
    servings: 4,
    prepTime: '30-60' as PrepTime,
    cookTime: '45',
    ingredients: [
      { name: 'green curry paste', quantity: 4, unit: 'tablespoons' },
      { name: 'coconut milk', quantity: 2, unit: 'cans', notes: '14 oz each' },
      { name: 'chicken breast', quantity: 1, unit: 'pound', notes: 'cut into chunks' },
      { name: 'bamboo shoots', quantity: 1, unit: 'can', notes: 'drained' },
      { name: 'bell peppers', quantity: 2, unit: 'whole', notes: 'sliced' },
      { name: 'fish sauce', quantity: 2, unit: 'tablespoons' },
      { name: 'palm sugar', quantity: 1, unit: 'tablespoon' },
      { name: 'Thai basil', quantity: 1, unit: 'cup', notes: 'leaves only' }
    ],
    instructions: [
      { order: 1, instruction: 'Heat coconut cream until oil separates' },
      { order: 2, instruction: 'Fry curry paste until fragrant' },
      { order: 3, instruction: 'Add chicken and cook until nearly done' },
      { order: 4, instruction: 'Add remaining coconut milk and vegetables' },
      { order: 5, instruction: 'Season with fish sauce and palm sugar' },
      { order: 6, instruction: 'Simmer until vegetables are tender' },
      { order: 7, instruction: 'Stir in Thai basil before serving' }
    ],
    mealTypes: ['dinner'],
    cuisine: ['Thai'],
    isFavorite: false,
    notes: 'Can be made vegetarian by substituting chicken with tofu',
    dateAdded: new Date()
  }
];

export const addTestRecipes = async () => {
  console.log('Adding test recipes...');
  
  for (const recipe of testRecipes) {
    try {
      const addedRecipe = await addRecipe(recipe);
      console.log(`Added recipe: ${addedRecipe.name} (${addedRecipe.id})`);
    } catch (error) {
      console.error(`Error adding recipe: ${recipe.name}`, error);
    }
  }
  
  console.log('Finished adding test recipes');
}; 