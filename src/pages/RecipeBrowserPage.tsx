import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { extractRecipeFromHtml } from '../services/gemini';
import toast from 'react-hot-toast';
import { addRecipe } from '../firebase/firestore';
import { Recipe, Instruction, getDisplayTotalTime } from '../types/recipe';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Local storage key for browser URL
const BROWSER_URL_STORAGE_KEY = 'recipe-browser-url';

export const RecipeBrowserPage: React.FC = () => {
  const [url, setUrl] = useState<string>(() => {
    // Initialize with saved URL from localStorage, or empty string
    return localStorage.getItem(BROWSER_URL_STORAGE_KEY) || '';
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<boolean>(false);
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Save URL to localStorage whenever it changes
  useEffect(() => {
    if (url) {
      localStorage.setItem(BROWSER_URL_STORAGE_KEY, url);
    }
  }, [url]);

  // If we have a saved URL on mount, make sure to load it
  useEffect(() => {
    if (url && !loading) {
      handleNavigate();
    }
  }, []);

  // Clear saved recipe ID when changing URL
  useEffect(() => {
    setSavedRecipeId(null);
  }, [url]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if input is not focused
      const isInputFocused = document.activeElement?.tagName === 'INPUT';

      // Navigate back: Alt+Left arrow
      if (e.altKey && e.key === 'ArrowLeft') {
        handleBrowserBack();
      }
      
      // Navigate forward: Alt+Right arrow
      if (e.altKey && e.key === 'ArrowRight') {
        handleBrowserForward();
      }
      
      // Refresh: F5
      if (e.key === 'F5') {
        e.preventDefault(); // Prevent default browser refresh
        handleBrowserRefresh();
      }
      
      // Extract recipe: Alt+E
      if (e.altKey && e.key === 'e' && !isInputFocused && !extracting && url.startsWith('http')) {
        extractRecipeData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [url, extracting]);

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
    
    // Format the URL properly
    let finalUrl = url.trim();
    
    // Check if it's a valid URL
    try {
      // If it doesn't have a protocol, add https://
      if (!finalUrl.match(/^https?:\/\//i)) {
        finalUrl = `https://${finalUrl}`;
      }
      
      // Test if it's a valid URL
      new URL(finalUrl);
      
      // Update the URL state
      setUrl(finalUrl);
    } catch (e) {
      setLoading(false);
      setError('Invalid URL format. Please enter a valid web address.');
      return;
    }
  };

  const handleBrowserBack = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.back();
      } catch (e) {
        console.error('Could not go back:', e);
      }
    }
  };

  const handleBrowserForward = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.forward();
      } catch (e) {
        console.error('Could not go forward:', e);
      }
    }
  };

  const handleBrowserRefresh = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.src = iframeRef.current.src;
      } catch (e) {
        console.error('Could not refresh:', e);
      }
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    
    // Try to update the URL input to match the current iframe URL
    // This might not work due to cross-origin restrictions, but we'll try
    try {
      if (iframeRef.current && iframeRef.current.contentWindow?.location.href) {
        const currentUrl = iframeRef.current.contentWindow.location.href;
        if (currentUrl !== 'about:blank' && currentUrl !== url) {
          setUrl(currentUrl);
        }
      }
    } catch (e) {
      // Silently fail on cross-origin issues
      console.debug('Could not access iframe URL due to cross-origin restrictions');
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
    localStorage.setItem('shopping-list-active-tab', 'recipes');
    localStorage.setItem('SELECTED_RECIPE_ID', savedRecipeId);
    
    // Force a page reload to apply the changes
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Recipe Browser" 
        actions={
          savedRecipeId && (
            <button
              onClick={handleViewRecipe}
              className="px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700"
            >
              View Saved Recipe
            </button>
          )
        }
      />
      
      <div className="flex flex-col flex-grow relative overflow-hidden">
        {/* URL bar and browser controls */}
        <div className="flex items-center p-2 bg-white border-b border-zinc-200 gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBrowserBack}
              className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              title="Go back (Alt+←)"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleBrowserForward}
              className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              title="Go forward (Alt+→)"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleBrowserRefresh}
              className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              title="Refresh (F5)"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-grow">
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter recipe URL"
              className="w-full p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500"
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
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute top-14 left-0 right-0 z-10 mx-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
            {error}
            <button 
              className="absolute top-2 right-2 text-red-800"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-violet-600"></div>
          </div>
        )}

        {/* Fullscreen iframe */}
        <iframe
          ref={iframeRef}
          src={url.startsWith('http') ? url : ''}
          className="w-full h-full border-0 flex-grow"
          sandbox="allow-same-origin allow-scripts"
          referrerPolicy="no-referrer"
          onLoad={handleIframeLoad}
        />

        {/* Floating Extract Recipe button */}
        {url && (
          <button
            onClick={extractRecipeData}
            disabled={extracting || !url.startsWith('http') || loading}
            className="fixed bottom-20 right-6 z-10 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center transform transition-transform hover:scale-105"
            title="Extract Recipe (Alt+E)"
          >
            {extracting ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default RecipeBrowserPage; 