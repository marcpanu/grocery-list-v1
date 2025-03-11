import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RecipeUrlImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { url: string; username?: string; password?: string }) => Promise<void>;
}

export const RecipeUrlImport = ({ isOpen, onClose, onImport }: RecipeUrlImportProps) => {
  const [url, setUrl] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onImport({
        url,
        ...(requiresAuth ? { username, password } : {})
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setRequiresAuth(false);
    setUsername('');
    setPassword('');
    setError(null);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={() => {
          onClose();
          resetForm();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={() => {
                      onClose();
                      resetForm();
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    Import Recipe from URL
                  </Dialog.Title>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* URL Input */}
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                        Recipe URL
                      </label>
                      <input
                        type="url"
                        id="url"
                        name="url"
                        required
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/recipe"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                      />
                    </div>

                    {/* Authentication Toggle */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requiresAuth"
                        checked={requiresAuth}
                        onChange={(e) => setRequiresAuth(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="requiresAuth" className="ml-2 block text-sm text-gray-700">
                        This site requires authentication
                      </label>
                    </div>

                    {/* Authentication Fields */}
                    {requiresAuth && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Import failed</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Importing...' : 'Import Recipe'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 