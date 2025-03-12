import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RecipeParseError } from '../../types/recipe';

interface RecipeUrlImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (recipe: { url: string; username?: string; password?: string }) => Promise<void>;
}

export const RecipeUrlImport: React.FC<RecipeUrlImportProps> = ({ isOpen, onClose, onImport }) => {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onImport({
        url,
        ...(requiresAuth ? { username, password } : {})
      });
      setUrl('');
      setUsername('');
      setPassword('');
      setRequiresAuth(false);
      onClose();
    } catch (err) {
      const error = err as RecipeParseError;
      if (error.code === 'AUTH_REQUIRED') {
        setRequiresAuth(true);
        setError('This recipe requires authentication. Please enter your credentials.');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setUsername('');
    setPassword('');
    setError(null);
    setRequiresAuth(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg"
          tabIndex={0}
          autoFocus
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
            <Dialog.Title className="text-lg font-semibold text-zinc-900">
              Import Recipe from URL
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-zinc-700">
                Recipe URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                required
                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            {requiresAuth && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Importing...' : 'Import Recipe'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 