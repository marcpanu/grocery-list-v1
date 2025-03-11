import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import app from './config';

export const auth = getAuth(app);

// Function to get the current user
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

// Function to ensure user is signed in (anonymously if not already signed in)
export const ensureSignedIn = async (): Promise<User> => {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    return currentUser;
  }
  
  const credential = await signInAnonymously(auth);
  return credential.user;
}; 