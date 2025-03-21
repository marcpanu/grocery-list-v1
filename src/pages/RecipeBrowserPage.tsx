import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { extractRecipeFromHtml } from '../services/gemini';
import toast from 'react-hot-toast';
import { addRecipe } from '../firebase/firestore';
import { Recipe, Instruction, getDisplayTotalTime } from '../types/recipe';

export const RecipeBrowserPage: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Clear saved recipe ID when changing URL
  useEffect(() => {
    setSavedRecipeId(null);
  }, [url]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  const handleNavigate = () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    let finalUrl = url;
    if (!finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
      setUrl(finalUrl);
    }
  };

  const extractRecipeData = async () => {
    if (!iframeRef.current || !url.startsWith('http')) {
      setError('No webpage loaded to extract recipe from');
      return;
    }

    try {
      setExtracting(true);
      const toastId = toast.loading('Extracting recipe data...');
      
      // Get the HTML content from the iframe
      // Note: This may not work due to cross-origin restrictions
      // We'll need to fall back to Gemini in most cases
      
      // Here we'd normally try to access the iframe content directly, but due to
      // cross-origin restrictions, we'll use the Gemini API directly with the URL
      
      // First try with direct extraction from URL
      const result = await extractRecipeFromHtml(`<url>${url}</url>`, url);
      
      if (result.text) {
        // Try to parse the recipe data from JSON
        try {
          const recipeData = JSON.parse(result.text);
          toast.success('Recipe extracted successfully!', { id: toastId });
          handleRecipeExtracted(recipeData);
        } catch (parseError) {
          toast.error('Failed to parse recipe data', { id: toastId });
          setError('Failed to parse recipe data. The response from Gemini is not valid JSON.');
        }
      } else if (result.error) {
        toast.error(`Could not extract recipe: ${result.error}`, { id: toastId });
        setError(`Could not extract recipe from this page: ${result.error}`);
      } else {
        toast.error('Could not extract recipe from this page', { id: toastId });
        setError('Could not extract recipe from this page. Try a different URL or check if the page contains a recipe.');
      }
    } catch (err) {
      console.error('Error extracting recipe:', err);
      toast.error(`Error extracting recipe: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(`Error extracting recipe: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExtracting(false);
    }
  };

  // Helper function to extract minutes from time strings like "30 minutes" or "1 hour 15 minutes"
  const parseTimeToMinutes = (timeString: string | null | undefined): number | null => {
    if (!timeString) return null;
    
    const timeStr = timeString.toLowerCase();
    let totalMinutes = 0;
    
    // Extract hours
    const hourMatch = timeStr.match(/(\d+)\s*h(our)?s?/);
    if (hourMatch && hourMatch[1]) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }
    
    // Extract minutes
    const minuteMatch = timeStr.match(/(\d+)\s*m(inute)?s?/);
    if (minuteMatch && minuteMatch[1]) {
      totalMinutes += parseInt(minuteMatch[1]);
    }
    
    return totalMinutes > 0 ? totalMinutes : null;
  };

  const handleRecipeExtracted = async (recipeData: any) => {
    console.log('Recipe extracted:', recipeData);
    
    try {
      // Parse time values
      const prepTimeMinutes = parseTimeToMinutes(recipeData.prepTime);
      const cookTimeMinutes = parseTimeToMinutes(recipeData.cookTime);
      const totalTimeMinutes = parseTimeToMinutes(recipeData.totalTime) || 
        (prepTimeMinutes && cookTimeMinutes ? prepTimeMinutes + cookTimeMinutes : null);
      
      // Format the data to match the Recipe interface
      const formattedRecipe = {
        name: recipeData.name,
        description: recipeData.description || null,
        prepTime: prepTimeMinutes,
        cookTime: cookTimeMinutes,
        totalTime: totalTimeMinutes,
        displayTotalTime: getDisplayTotalTime(totalTimeMinutes),
        servings: recipeData.servings || 1,
        ingredients: recipeData.ingredients.map((ing: any) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit || null,
          notes: ing.notes || null
        })),
        instructions: recipeData.instructions.map((instruction: string, index: number) => ({
          order: index + 1,
          instruction
        })),
        imageUrl: recipeData.imageUrl || null,
        notes: null,
        mealTypes: null,
        cuisine: recipeData.cuisine || null,
        rating: null,
        dateAdded: new Date(),
        isFavorite: false,
        source: recipeData.source 
          ? {
              type: 'url' as const,
              url: typeof recipeData.source === 'string' 
                ? recipeData.source 
                : recipeData.source.url || url,
              title: recipeData.name
            }
          : {
              type: 'url' as const,
              url: url,
              title: recipeData.name
            }
      };

      // Save the recipe to the database
      const savedRecipe = await addRecipe(formattedRecipe);
      
      toast.success(`Recipe "${savedRecipe.name}" saved successfully!`);
      setSavedRecipeId(savedRecipe.id);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error(`Failed to save recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Redirect to recipe details via changing the app tab and passing the recipe ID
  const handleViewRecipe = () => {
    if (!savedRecipeId) return;
    
    // Since tab navigation is managed in AppLayout, we need to store this info
    // and handle it at the app level
    localStorage.setItem('ACTIVE_TAB_STORAGE_KEY', 'recipes');
    localStorage.setItem('SELECTED_RECIPE_ID', savedRecipeId);
    
    // Force a page reload to apply the changes
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Recipe Browser" />
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex mb-4">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="Enter recipe URL"
            className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          />
          <button
            onClick={handleNavigate}
            className="px-4 py-2 bg-violet-600 text-white font-medium rounded-r-md hover:bg-violet-700"
            disabled={loading}
          >
            Go
          </button>
        </div>

        <div className="mb-4 flex justify-between">
          {url && (
            <button
              onClick={extractRecipeData}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400"
              disabled={extracting || !url.startsWith('http') || loading}
            >
              {extracting ? 'Extracting...' : 'Extract Recipe'}
            </button>
          )}
          
          {savedRecipeId && (
            <button
              onClick={handleViewRecipe}
              className="px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700"
            >
              View Saved Recipe
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center flex-grow">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && (
          <iframe
            ref={iframeRef}
            src={url.startsWith('http') ? url : ''}
            className="w-full flex-grow border rounded-md"
            sandbox="allow-same-origin allow-scripts"
            referrerPolicy="no-referrer"
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
};

export default RecipeBrowserPage; 