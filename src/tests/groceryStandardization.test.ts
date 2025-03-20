/// <reference types="jest" />

import { 
  standardizeGroceryItem, 
  processIngredientsForGrocery,
  findIngredientConversion,
  convertToCups
} from '../utils/groceryStandardization';
import { Ingredient } from '../types';

describe('Grocery Standardization Utility', () => {
  describe('convertToCups', () => {
    test('converts teaspoons to cups', () => {
      expect(convertToCups(6, 'tsp')).toBeCloseTo(0.125, 2); // 6 tsp = 0.125 cup
    });
    
    test('converts tablespoons to cups', () => {
      expect(convertToCups(4, 'tbsp')).toBeCloseTo(0.25, 2); // 4 tbsp = 0.25 cup
    });
    
    test('handles different unit spellings', () => {
      expect(convertToCups(1, 'teaspoon')).toBeCloseTo(1/48, 2);
      expect(convertToCups(1, 'tablespoon')).toBeCloseTo(1/16, 2);
    });
    
    test('returns original value for unknown units', () => {
      expect(convertToCups(2, 'unknown')).toBe(2);
    });
  });
  
  describe('findIngredientConversion', () => {
    test('finds exact matches', () => {
      const match = findIngredientConversion('bell pepper');
      expect(match?.name).toBe('bell pepper');
    });
    
    test('finds ingredient by variant name', () => {
      const match = findIngredientConversion('red bell pepper');
      expect(match?.name).toBe('bell pepper');
    });
    
    test('handles partial matches', () => {
      const match = findIngredientConversion('diced red bell peppers');
      expect(match?.name).toBe('bell pepper');
    });
    
    test('returns undefined for unknown ingredients', () => {
      const match = findIngredientConversion('unknown ingredient');
      expect(match).toBeUndefined();
    });
  });
  
  describe('standardizeGroceryItem', () => {
    test('converts 1/2 cup chopped bell pepper to 1 bell pepper', () => {
      const ingredient: Ingredient = {
        name: 'chopped bell pepper',
        quantity: 0.5,
        unit: 'cup',
        notes: null
      };
      
      const standardized = standardizeGroceryItem(ingredient);
      expect(standardized.name).toBe('bell pepper');
      expect(standardized.quantity).toBe(1);
      expect(standardized.unit).toBe('whole');
    });
    
    test('converts 2 tbsp minced garlic to 6 garlic cloves', () => {
      const ingredient: Ingredient = {
        name: 'minced garlic',
        quantity: 2,
        unit: 'tbsp',
        notes: null
      };
      
      const standardized = standardizeGroceryItem(ingredient);
      expect(standardized.name).toBe('garlic');
      expect(standardized.quantity).toBe(6); // 2 tbsp (1/8 cup) * 150g/cup = 18.75g / 5g per clove ≈ 4 cloves, rounded up to 5
      expect(standardized.unit).toBe('clove');
    });
    
    test('converts 3 cups flour to grams', () => {
      const ingredient: Ingredient = {
        name: 'all-purpose flour',
        quantity: 3,
        unit: 'cups',
        notes: null
      };
      
      const standardized = standardizeGroceryItem(ingredient);
      expect(standardized.name).toBe('flour');
      expect(standardized.quantity).toBe(360); // 3 cups * 120g/cup = 360g
      expect(standardized.unit).toBe('g');
    });
    
    test('handles string quantities', () => {
      const ingredient: Ingredient = {
        name: 'diced onion',
        quantity: '1/4',
        unit: 'cup',
        notes: null
      };
      
      const standardized = standardizeGroceryItem(ingredient);
      expect(standardized.name).toBe('onion');
      expect(standardized.quantity).toBe(1);
      expect(standardized.unit).toBe('whole');
    });
    
    test('handles unknown ingredients by returning as-is', () => {
      const ingredient: Ingredient = {
        name: 'exotic spice',
        quantity: 2,
        unit: 'tsp',
        notes: null
      };
      
      const standardized = standardizeGroceryItem(ingredient);
      expect(standardized.name).toBe('exotic spice');
      expect(standardized.quantity).toBe(2);
      expect(standardized.unit).toBe('tsp');
    });
  });
  
  describe('processIngredientsForGrocery', () => {
    test('combines duplicate ingredients', () => {
      const ingredients: Ingredient[] = [
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
      
      const processed = processIngredientsForGrocery(ingredients);
      expect(processed.length).toBe(1);
      expect(processed[0].name).toBe('bell pepper');
      expect(processed[0].quantity).toBe(2);
      expect(processed[0].unit).toBe('whole');
    });
    
    test('processes mixed ingredients correctly', () => {
      const ingredients: Ingredient[] = [
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
          name: 'all-purpose flour',
          quantity: 2,
          unit: 'cups',
          notes: null
        }
      ];
      
      const processed = processIngredientsForGrocery(ingredients);
      expect(processed.length).toBe(3);
      
      // Find each item in the results
      const onion = processed.find(item => item.name === 'onion');
      const garlic = processed.find(item => item.name === 'garlic');
      const flour = processed.find(item => item.name === 'flour');
      
      expect(onion).toBeDefined();
      expect(onion?.quantity).toBe(1);
      expect(onion?.unit).toBe('whole');
      
      expect(garlic).toBeDefined();
      expect(garlic?.quantity).toBe(6);
      expect(garlic?.unit).toBe('clove');
      
      expect(flour).toBeDefined();
      expect(flour?.quantity).toBe(240);
      expect(flour?.unit).toBe('g');
    });
  });
}); 