import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from './config';

const STORAGE_PATHS = {
  RECIPE_IMAGES: 'recipe-images'
} as const;

export const uploadRecipeImage = async (imageFile: File, recipeId: string) => {
  const imageRef = ref(storage, `${STORAGE_PATHS.RECIPE_IMAGES}/${recipeId}/${imageFile.name}`);
  const snapshot = await uploadBytes(imageRef, imageFile);
  return getDownloadURL(snapshot.ref);
};

export const getRecipeImageUrl = async (recipeId: string, imageName: string) => {
  const imageRef = ref(storage, `${STORAGE_PATHS.RECIPE_IMAGES}/${recipeId}/${imageName}`);
  return getDownloadURL(imageRef);
};

export const deleteRecipeImage = async (recipeId: string, imageName: string) => {
  const imageRef = ref(storage, `${STORAGE_PATHS.RECIPE_IMAGES}/${recipeId}/${imageName}`);
  return deleteObject(imageRef);
}; 