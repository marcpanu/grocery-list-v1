import { PantryItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_PANTRY_ITEMS: PantryItem[] = [
  // Basic Cooking Essentials
  {
    id: uuidv4(),
    name: 'Salt',
    variants: ['table salt', 'kosher salt', 'sea salt', 'iodized salt'],
    category: 'basic'
  },
  {
    id: uuidv4(),
    name: 'Black pepper',
    variants: ['ground pepper', 'whole peppercorns', 'cracked pepper', 'peppercorn'],
    category: 'basic'
  },
  {
    id: uuidv4(),
    name: 'Cooking oil',
    variants: ['vegetable oil', 'avocado oil', 'canola oil', 'olive oil', 'sunflower oil', 'corn oil'],
    category: 'basic'
  },
  {
    id: uuidv4(),
    name: 'Vinegar',
    variants: ['white vinegar', 'distilled vinegar', 'apple cider vinegar', 'red wine vinegar'],
    category: 'basic'
  },
  {
    id: uuidv4(),
    name: 'Water',
    variants: ['tap water', 'distilled water', 'spring water', 'filtered water'],
    category: 'basic'
  },  
  
  // Dry Goods & Baking Staples
  {
    id: uuidv4(),
    name: 'All-purpose flour',
    variants: ['flour', 'plain flour'],
    category: 'dry-goods'
  },
  {
    id: uuidv4(),
    name: 'Baking powder',
    variants: [],
    category: 'dry-goods'
  },
  {
    id: uuidv4(),
    name: 'Baking soda',
    variants: ['sodium bicarbonate', 'bicarbonate of soda'],
    category: 'dry-goods'
  },
  {
    id: uuidv4(),
    name: 'Granulated sugar',
    variants: ['white sugar', 'sugar'],
    category: 'dry-goods'
  },
  
  // Spices & Seasonings
  {
    id: uuidv4(),
    name: 'Garlic powder',
    variants: ['dried garlic'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Onion powder',
    variants: ['dried onion'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Paprika',
    variants: ['regular paprika', 'smoked paprika'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Chili powder',
    variants: [],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Cumin',
    variants: ['ground cumin', 'cumin powder', 'cumin seeds'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Oregano',
    variants: ['dried oregano'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Thyme',
    variants: ['dried thyme'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Rosemary',
    variants: ['dried rosemary'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Bay leaves',
    variants: ['bay leaf', 'dried bay leaves'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Cinnamon',
    variants: ['ground cinnamon', 'cinnamon sticks'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Nutmeg',
    variants: ['ground nutmeg'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Cayenne pepper',
    variants: ['ground cayenne'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Red pepper flakes',
    variants: ['crushed red pepper', 'chili flakes'],
    category: 'spices'
  },
  {
    id: uuidv4(),
    name: 'Italian seasoning',
    variants: ['italian herbs', 'mixed herbs'],
    category: 'spices'
  }
]; 