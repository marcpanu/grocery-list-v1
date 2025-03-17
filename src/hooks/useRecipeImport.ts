import { useState } from 'react';
import { Recipe } from '../types/recipe';
import { importRecipeFromUrl } from '../services/recipeImport';

/**
 * Custom hook for managing recipe import functionality.
 * 
 * This hook provides a consistent way to handle recipe imports across different pages
 * while allowing customized post-import behavior through the onRecipeCreated callback.
 * 
 * Usage from Recipe page:
 * ```typescript
 * const { showImportModal, setShowImportModal, handleImportOptionSelect } = 
 *   useRecipeImport((recipe) => {
 *     // Just refresh the recipe list
 *     refreshRecipes();
 *   });
 * ```
 * 
 * Usage from Meal Plan page:
 * ```typescript
 * const { showImportModal, setShowImportModal, handleImportOptionSelect } = 
 *   useRecipeImport((recipe) => {
 *     // Open the Add Meal modal with the imported recipe
 *     setSelectedRecipe(recipe);
 *     setShowAddMealModal(true);
 *   });
 * ```
 * 
 * @param onRecipeCreated Callback function that will be called after a recipe is successfully imported.
 *                       Different pages can implement different post-import behaviors.
 */
export const useRecipeImport = (onRecipeCreated: (recipe: Recipe) => void) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUrlImportModal, setShowUrlImportModal] = useState(false);
  // TODO: Add states for future import methods
  // const [showInstagramImportModal, setShowInstagramImportModal] = useState(false);
  // const [showTikTokImportModal, setShowTikTokImportModal] = useState(false);

  const handleImportOptionSelect = (optionId: string) => {
    setShowImportModal(false);
    switch (optionId) {
      case 'url':
        setShowUrlImportModal(true);
        break;
      // TODO: Handle future import methods
      // When implementing Instagram import:
      // case 'instagram':
      //   setShowInstagramImportModal(true);
      //   break;
      // When implementing TikTok import:
      // case 'tiktok':
      //   setShowTikTokImportModal(true);
      //   break;
      case 'manual':
        // Manual creation is handled differently per page
        onRecipeCreated(null as any); // This will trigger the appropriate modal in each page
        break;
    }
  };

  const closeUrlImport = () => {
    setShowUrlImportModal(false);
  };

  const handleUrlImport = async (data: { url: string; username?: string; password?: string }) => {
    try {
      const { recipe } = await importRecipeFromUrl(data);
      setShowUrlImportModal(false);
      onRecipeCreated(recipe);
    } catch (error) {
      throw error; // Let the UI component handle the error
    }
  };

  // TODO: Add handlers for future import methods
  // When implementing Instagram import:
  // const handleInstagramImport = async (data: InstagramImportData) => {
  //   try {
  //     const recipe = await importRecipeFromInstagram(data);
  //     setShowInstagramImportModal(false);
  //     onRecipeCreated(recipe);
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // When implementing TikTok import:
  // const handleTikTokImport = async (data: TikTokImportData) => {
  //   try {
  //     const recipe = await importRecipeFromTikTok(data);
  //     setShowTikTokImportModal(false);
  //     onRecipeCreated(recipe);
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  return {
    showImportModal,
    setShowImportModal,
    showUrlImportModal,
    closeUrlImport,
    handleImportOptionSelect,
    handleUrlImport,
    // TODO: Export future import states and handlers
    // showInstagramImportModal,
    // setShowInstagramImportModal,
    // handleInstagramImport,
    // showTikTokImportModal,
    // setShowTikTokImportModal,
    // handleTikTokImport,
  };
}; 