import { ParsedRecipe, ParsedIngredient, RecipeParseError } from '../types/recipe';
import { extractRecipeFromHtml } from './gemini';

/**
 * Attempts to parse a recipe from a URL using multiple strategies
 */
export async function parseRecipeUrl(url: string, credentials?: { username?: string; password?: string }): Promise<ParsedRecipe> {
  try {
    // Fetch the page content
    const html = await fetchPage(url, credentials);
    
    // Try Schema.org parsing first
    const schemaRecipe = await parseSchemaOrgRecipe(html);
    if (schemaRecipe) {
      return schemaRecipe;
    }

    // Fallback to LLM parsing
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
 * Fetches the page content with proper headers and error handling
 */
async function fetchPage(url: string, credentials?: { username?: string; password?: string }): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RecipeParser/1.0)',
    },
    credentials: credentials ? 'include' : 'omit',
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw {
        message: 'Authentication required to access this recipe',
        code: 'AUTH_REQUIRED' as const,
        details: { status: response.status }
      };
    }
    throw {
      message: 'Failed to fetch recipe page',
      code: 'NETWORK_ERROR' as const,
      details: { status: response.status }
    };
  }

  return response.text();
}

/**
 * Attempts to parse recipe data using Schema.org markup (JSON-LD and microdata)
 */
async function parseSchemaOrgRecipe(html: string): Promise<ParsedRecipe | null> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Try JSON-LD first
  const jsonLdScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      const recipes = findRecipes(data);
      if (recipes.length > 0) {
        return convertSchemaRecipe(recipes[0]);
      }
    } catch (e) {
      console.warn('Failed to parse JSON-LD script:', e);
    }
  }

  // Try microdata as fallback
  const microdata = extractMicrodata(doc);
  if (microdata) {
    return convertSchemaRecipe(microdata);
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
function convertSchemaRecipe(schema: any): ParsedRecipe {
  const ingredients = (schema.recipeIngredient || []).map((text: string) => {
    return parseIngredient(text);
  });

  const instructions = (schema.recipeInstructions || []).map((instruction: any) => {
    if (typeof instruction === 'string') {
      return instruction;
    }
    return instruction.text || instruction.description || '';
  }).filter(Boolean);

  return {
    name: schema.name || 'Untitled Recipe',
    description: schema.description,
    prepTime: schema.prepTime,
    cookTime: schema.cookTime,
    totalTime: schema.totalTime,
    servings: parseServings(schema.recipeYield),
    ingredients,
    instructions,
    imageUrl: schema.image,
    author: typeof schema.author === 'string' ? schema.author : schema.author?.name,
    source: window.location.href
  };
}

/**
 * Parses an ingredient string into structured data
 */
function parseIngredient(text: string): ParsedIngredient {
  // Basic ingredient parsing - this can be enhanced
  const ingredient: ParsedIngredient = {
    original: text,
    name: text
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
  const { text, error } = await extractRecipeFromHtml(html);
  
  if (error || !text) {
    throw {
      message: error || 'Failed to extract recipe using LLM',
      code: 'PARSE_ERROR' as const,
      details: { url }
    };
  }

  try {
    const recipe = JSON.parse(text);
    return {
      name: recipe.name,
      description: recipe.description,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map((ing: any) => ({
        original: `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim(),
        quantity: ing.quantity,
        unit: ing.unit,
        name: ing.name,
        notes: ing.notes
      })),
      instructions: recipe.instructions,
      imageUrl: recipe.imageUrl,
      author: recipe.author,
      source: url
    };
  } catch (e) {
    throw {
      message: 'Failed to parse LLM response',
      code: 'PARSE_ERROR' as const,
      details: { url, error: e }
    };
  }
}

// Type guard for RecipeParseError
function isRecipeParseError(error: any): error is RecipeParseError {
  return error && typeof error.message === 'string' && typeof error.code === 'string';
} 