import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Gemini API key not found in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Extracts recipe information from HTML content using Gemini
 */
export async function extractRecipeFromHtml(html: string): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Extract recipe information from the following HTML content. Return a JSON object with these fields:
      - name: Recipe name (string)
      - description: Recipe description (string, optional)
      - prepTime: Preparation time (string, optional)
      - cookTime: Cooking time (string, optional)
      - totalTime: Total time (string, optional)
      - servings: Number of servings (number, optional)
      - ingredients: Array of ingredients, each with:
        - quantity: number or string (optional)
        - unit: string (optional)
        - name: string
        - notes: string (optional)
      - instructions: Array of strings, each a step in the recipe
      - imageUrl: URL of recipe image (string, optional)
      - author: Recipe author (string, optional)

      HTML Content:
      ${html}

      Return ONLY the JSON object, no other text. If you can't find certain information, omit those fields.
      If you can't find enough information to create a valid recipe (at minimum: name, ingredients, and instructions),
      return { "error": "Could not extract sufficient recipe information" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the response as JSON
    try {
      const parsed = JSON.parse(text);
      if (parsed.error) {
        return { text: '', error: parsed.error };
      }
      return { text: JSON.stringify(parsed) };
    } catch (e) {
      return { text: '', error: 'Failed to parse Gemini response as JSON' };
    }
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 