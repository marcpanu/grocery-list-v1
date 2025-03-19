import { ParsedRecipe, ParsedIngredient, RecipeParseError } from '../types/recipe';
import { extractRecipeFromHtml } from './gemini';

/**
 * Attempts to parse a recipe from a URL using multiple strategies
 */
export async function parseRecipeUrl(url: string): Promise<ParsedRecipe> {
  try {
    // Fetch the page content
    const html = await fetchPage(url);
    
    // Try Schema.org parsing first
    const schemaRecipe = await parseSchemaOrgRecipe(html, url);
    
    if (schemaRecipe) {
      // Check for missing required fields
      const missingFields = checkMissingFields(schemaRecipe);
      
      if (missingFields.length > 0) {
        // Use LLM to fill in missing fields
        const llmRecipe = await parseLLMRecipe(html, url);
        
        // Merge the recipes, preferring schema values over LLM values except for missing fields
        return {
          ...llmRecipe,
          ...schemaRecipe,
          // Explicitly handle fields that might be undefined
          cookTime: schemaRecipe.cookTime || llmRecipe.cookTime,
          prepTime: schemaRecipe.prepTime || llmRecipe.prepTime,
          totalTime: schemaRecipe.totalTime || llmRecipe.totalTime,
          servings: schemaRecipe.servings || llmRecipe.servings,
          ingredients: schemaRecipe.ingredients?.length ? schemaRecipe.ingredients : llmRecipe.ingredients,
          instructions: schemaRecipe.instructions?.length ? schemaRecipe.instructions : llmRecipe.instructions,
          imageUrl: schemaRecipe.imageUrl || llmRecipe.imageUrl,
          cuisine: schemaRecipe.cuisine?.length ? schemaRecipe.cuisine : llmRecipe.cuisine
        };
      }
      
      return schemaRecipe;
    }

    // Fallback to LLM parsing if no schema data found
    return await parseLLMRecipe(html, url);
  } catch (error) {
    if (isRecipeParseError(error)) {
      throw error;
    }
    throw {
      message: 'An unexpected error occurred while parsing the recipe',
      code: 'PARSE_ERROR' as const,
      details: error
    };
  }
}

/**
 * Checks for missing or undefined required fields in a recipe
 */
function checkMissingFields(recipe: ParsedRecipe): string[] {
  const requiredFields: (keyof ParsedRecipe)[] = [
    'name',
    'cookTime',
    'prepTime',
    'servings',
    'ingredients',
    'instructions'
  ];
  
  return requiredFields.filter(field => {
    const value = recipe[field];
    if (Array.isArray(value)) {
      return !value.length;
    }
    return value === undefined || value === null;
  });
}

/**
 * Fetches the page content with proper headers and error handling
 */
async function fetchPage(url: string): Promise<string> {
  // List of CORS proxies to try in order
  const proxies = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  let lastError: Error | null = null;

  // Try each proxy in sequence
  for (const proxyUrl of proxies) {
    const proxyUrlString = proxyUrl(url);
    console.log(`DEBUG: Attempting proxy: ${proxyUrlString}`);
    
    try {
      const response = await fetch(proxyUrlString);
      console.log(`DEBUG: Proxy response status: ${response.status}`);
      console.log(`DEBUG: Proxy response headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different proxy response formats
      const contentType = response.headers.get('content-type');
      console.log(`DEBUG: Proxy response content-type: ${contentType}`);
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log(`DEBUG: Proxy JSON response keys:`, Object.keys(data));
        // allorigins format
        if (data.contents) {
          console.log(`DEBUG: Using allorigins proxy response`);
          return data.contents;
        }
        // other JSON format
        console.log(`DEBUG: Using generic JSON proxy response`);
        return data;
      }

      // Direct HTML response
      const text = await response.text();
      console.log(`DEBUG: Using direct HTML proxy response, length: ${text.length}`);
      return text;

    } catch (err) {
      console.warn(`DEBUG: Proxy failed: ${proxyUrlString}`, err);
      lastError = err as Error;
      continue; // Try next proxy
    }
  }

  // If we get here, all proxies failed
  throw {
    message: 'Failed to fetch recipe page after trying multiple proxies',
    code: 'NETWORK_ERROR' as const,
    details: { 
      error: lastError?.message || 'All proxies failed',
      url 
    }
  };
}

/**
 * Attempts to parse recipe data using Schema.org markup (JSON-LD and microdata)
 */
async function parseSchemaOrgRecipe(html: string, url: string): Promise<ParsedRecipe | null> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Try JSON-LD first
  const jsonLdScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      const recipes = findRecipes(data);
      if (recipes.length > 0) {
        return convertSchemaRecipe(recipes[0], url);
      }
    } catch (e) {
      console.warn('Failed to parse JSON-LD script:', e);
    }
  }

  // Try microdata as fallback
  const microdata = extractMicrodata(doc);
  if (microdata) {
    return convertSchemaRecipe(microdata, url);
  }

  return null;
}

/**
 * Recursively finds Recipe objects in JSON-LD data
 */
function findRecipes(data: any): any[] {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.flatMap(item => findRecipes(item));
  }
  
  if (typeof data === 'object') {
    if (data['@type'] === 'Recipe') {
      return [data];
    }
    return Object.values(data).flatMap(value => findRecipes(value));
  }
  
  return [];
}

/**
 * Extracts microdata recipe information from HTML
 */
function extractMicrodata(doc: Document): any | null {
  const recipe = doc.querySelector('[itemtype$="/Recipe"], [itemtype*="schema.org/Recipe"]');
  if (!recipe) return null;

  const extract = (prop: string) => {
    const el = recipe.querySelector(`[itemprop="${prop}"]`);
    if (!el) return undefined;
    return el.getAttribute('content') || el.textContent?.trim();
  };

  const extractMultiple = (prop: string) => {
    return Array.from(recipe.querySelectorAll(`[itemprop="${prop}"]`))
      .map(el => el.getAttribute('content') || el.textContent?.trim())
      .filter(Boolean);
  };

  return {
    '@type': 'Recipe',
    name: extract('name'),
    description: extract('description'),
    recipeInstructions: extractMultiple('recipeInstructions'),
    recipeIngredient: extractMultiple('recipeIngredient'),
    prepTime: extract('prepTime'),
    cookTime: extract('cookTime'),
    totalTime: extract('totalTime'),
    recipeYield: extract('recipeYield'),
    image: extract('image'),
    author: extract('author'),
  };
}

/**
 * Converts Schema.org recipe data to our ParsedRecipe format
 */
function convertSchemaRecipe(schema: any, url: string): ParsedRecipe {
  const ingredients = (schema.recipeIngredient || []).map((text: string) => {
    return parseIngredient(text);
  });

  const instructions = (schema.recipeInstructions || []).map((instruction: any) => {
    if (typeof instruction === 'string') {
      return instruction;
    }
    return instruction.text || instruction.description || '';
  }).filter(Boolean);

  // Helper function to convert time strings to minutes
  const timeToMinutes = (time: string | undefined): number | undefined => {
    if (!time) return undefined;
    
    // Remove any PT prefix (ISO duration format)
    time = time.replace(/^PT/, '');
    
    let minutes = 0;
    
    // Handle hours
    const hoursMatch = time.match(/(\d+)H/);
    if (hoursMatch) {
      minutes += parseInt(hoursMatch[1]) * 60;
    }
    
    // Handle minutes
    const minutesMatch = time.match(/(\d+)M/);
    if (minutesMatch) {
      minutes += parseInt(minutesMatch[1]);
    }
    
    return minutes;
  };

  // Handle image URL (can be string or object)
  const imageUrl = typeof schema.image === 'string' 
    ? schema.image 
    : Array.isArray(schema.image) 
      ? schema.image[0]?.url || schema.image[0] 
      : schema.image?.url;

  return {
    name: schema.name || 'Untitled Recipe',
    description: schema.description || undefined,
    prepTime: timeToMinutes(schema.prepTime),
    cookTime: timeToMinutes(schema.cookTime),
    servings: parseServings(schema.recipeYield) || 4,
    ingredients,
    instructions,
    imageUrl: imageUrl || undefined,
    author: typeof schema.author === 'string' ? schema.author : schema.author?.name,
    source: url,
    cuisine: Array.isArray(schema.recipeCuisine) 
      ? schema.recipeCuisine 
      : schema.recipeCuisine 
        ? [schema.recipeCuisine] 
        : undefined
  };
}

/**
 * Parses an ingredient string into structured data
 */
function parseIngredient(text: string): ParsedIngredient {
  // Basic ingredient parsing - this can be enhanced
  const ingredient: ParsedIngredient = {
    original: text,
    name: text,
    quantity: 1 // Default to 1 if parsing fails
  };

  // Try to extract quantity and unit
  const match = text.match(/^([\d./\s]+)?\s*([a-zA-Z]+)?\s+(.+)$/);
  if (match) {
    const [, quantity, unit, name] = match;
    if (quantity) {
      ingredient.quantity = parseQuantity(quantity);
    }
    if (unit) {
      ingredient.unit = unit.toLowerCase();
    }
    ingredient.name = name;
  }

  // Check for notes in parentheses
  const notesMatch = ingredient.name.match(/(.*?)\s*\((.*?)\)\s*$/);
  if (notesMatch) {
    ingredient.name = notesMatch[1].trim();
    ingredient.notes = notesMatch[2].trim();
  }

  return ingredient;
}

/**
 * Parses serving information into a number
 */
function parseServings(yield_: string | number | undefined): number | undefined {
  if (!yield_) return undefined;
  if (typeof yield_ === 'number') return yield_;
  
  // Try to extract first number from string
  const match = yield_.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

/**
 * Parses ingredient quantities
 */
function parseQuantity(quantity: string): number | string {
  quantity = quantity.trim();
  
  // Handle fractions
  if (quantity.includes('/')) {
    const [num, denom] = quantity.split('/').map(Number);
    return num / denom;
  }
  
  // Handle mixed numbers (e.g., "1 1/2")
  const parts = quantity.split(' ');
  if (parts.length === 2 && parts[1].includes('/')) {
    const whole = Number(parts[0]);
    const [num, denom] = parts[1].split('/').map(Number);
    return whole + (num / denom);
  }

  // Try to parse as number, otherwise return original string
  const parsed = Number(quantity);
  return isNaN(parsed) ? quantity : parsed;
}

/**
 * Uses LLM to extract recipe information from HTML content
 */
async function parseLLMRecipe(html: string, url: string): Promise<ParsedRecipe> {
  const { text, error } = await extractRecipeFromHtml(html, url);
  
  if (error || !text) {
    console.error('LLM extraction error:', error);
    throw {
      message: error || 'Failed to extract recipe using LLM',
      code: 'PARSE_ERROR' as const,
      details: { url }
    };
  }

  try {
    console.log('Attempting to parse LLM response:', text);
    const recipe = JSON.parse(text);
    
    // Log the parsed recipe object
    console.log('Successfully parsed LLM response:', recipe);
    console.log('DEBUG: Source from parsed recipe:', recipe.source);
    
    const parsedRecipe = {
      name: recipe.name || 'Untitled Recipe',
      description: recipe.description || undefined,
      prepTime: recipe.prepTime || '30-60',
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings || 4,
      ingredients: recipe.ingredients.map((ing: any) => ({
        original: `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim(),
        quantity: ing.quantity,
        unit: ing.unit,
        name: ing.name,
        notes: ing.notes
      })),
      instructions: recipe.instructions || [],
      imageUrl: recipe.imageUrl,
      author: recipe.author,
      source: recipe.source,
      cuisine: Array.isArray(recipe.cuisine) ? recipe.cuisine : recipe.cuisine ? [recipe.cuisine] : []
    };
    
    console.log('DEBUG: Source in final parsed recipe:', parsedRecipe.source);
    return parsedRecipe;
  } catch (e) {
    console.error('Failed to parse LLM response:', e);
    console.log('Raw LLM response that failed parsing:', text);
    throw {
      message: 'Failed to parse LLM response',
      code: 'PARSE_ERROR' as const,
      details: { url, error: e, rawResponse: text }
    };
  }
}

// Type guard for RecipeParseError
function isRecipeParseError(error: any): error is RecipeParseError {
  return error && typeof error.message === 'string' && typeof error.code === 'string';
} 