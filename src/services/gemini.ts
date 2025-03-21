const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY environment variable is required');
}

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-8b:generateContent';

/**
 * Clean HTML content for better text extraction
 */
function cleanHtml(html: string): string {
  // Step 1: Remove script and style tags
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Step 2: Remove all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Step 3: Trim extra spaces and line breaks
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Step 4: Remove non-ASCII characters and HTML entities
  cleaned = cleaned.replace(/[^\x20-\x7E]/g, '')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&[a-z]+;/g, ' ');

  // Step 5: Normalize whitespace and line breaks
  cleaned = cleaned.replace(/\s+/g, ' ')
                  .replace(/\n{2,}/g, '\n')
                  .trim();

  return cleaned;
}

/**
 * Extract recipe information from HTML content using Gemini
 */
export async function extractRecipeFromHtml(html: string, url: string): Promise<{ text?: string; error?: string }> {
  try {
    const cleanedHtml = cleanHtml(html);
    console.log(`DEBUG: Original URL being passed to Gemini: ${url}`);

    const prompt = `Extract a recipe from the following text and return it as a JSON object. 
    
DO NOT include markdown formatting, code blocks, or any other text - ONLY return the raw JSON object.

DO NOT INCLUDE ANY FRACTIONS (e.g., 1/4 cup or 1 / 4 cup, should instead be 0.25 cup). Convert any fractions to decimal format.

Required fields and format:
{
  "name": string (required),
  "description": string (required),
  "prepTime": string (optional),
  "cookTime": string (optional),
  "totalTime": string (optional),
  "servings": number (optional),
  "ingredients": [
    {
      "quantity": number (required),
      "unit": string (required),
      "name": string (required),
      "notes": string (optional)
    }
  ],
  "instructions": string[],
  "imageUrl": string (optional) - Look for the largest or most prominent image on the page, typically the main recipe photo. If multiple images exist, prefer the one that appears first or is marked as the featured image. The URL should be a direct link to the image file (ending in .jpg, .png, etc.).
  "author": string (optional),
  "cuisine": string[] (required),
  "source": string (required) - The URL of the recipe page (${url})
}

If insufficient data is available, respond with: {"error": "Not enough recipe details found for extraction."}

Text to analyze:
${cleanedHtml}`;

    // Log the full prompt for debugging
    console.log('===== GEMINI PROMPT BEGINS =====');
    console.log(prompt);
    console.log('===== GEMINI PROMPT ENDS =====');
    
    // Log a shortened version for quick viewing
    const shortPrompt = prompt.substring(0, 500) + '... [truncated]';
    console.log('Sending prompt to Gemini (truncated):', shortPrompt);
    
    // Log the HTML length to help debug issues
    console.log(`HTML content length: ${cleanedHtml.length} characters`);

    const requestBody = JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });
    
    // Log the full request for debugging
    console.log('Gemini API Request Body Size:', requestBody.length, 'bytes');

    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw Gemini API Response:', data);
    
    let generatedText = data.candidates[0]?.content?.parts[0]?.text;
    console.log('Generated Text from Gemini (before cleaning):', generatedText);

    if (!generatedText) {
      throw new Error('No text generated from Gemini');
    }

    // Clean the response by removing markdown code blocks and any extra text
    generatedText = generatedText
      .replace(/^```(?:json)?\s*/, '')  // Remove opening code block
      .replace(/\s*```$/, '')           // Remove closing code block
      .trim();                          // Remove any extra whitespace

    console.log('Generated Text from Gemini (after cleaning):', generatedText);

    // Try parsing as JSON to validate the response
    try {
      JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Invalid JSON response:', generatedText);
      throw new Error('Generated text is not valid JSON');
    }

    return { text: generatedText };
  } catch (error) {
    console.error('Error in extractRecipeFromHtml:', error);
    console.log('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error
    });
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
} 