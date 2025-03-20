import { useState, useMemo, useEffect } from 'react';
import { 
  PhotoIcon, 
  KeyIcon, 
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ConfirmDialog } from '../ConfirmDialog';

interface StoredCredential {
  id: string;
  domain: string;
  username: string;
  lastUsed: Date;
}

interface DataManagementProps {
  imageCount: number;
  totalImageSize: string;
  storedCredentials: StoredCredential[];
  onDeleteImages: () => Promise<void>;
  onDeleteCredential: (id: string) => Promise<void>;
  onAddCredential: (domain: string, username: string, password: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 5;

export const DataManagement = ({
  imageCount,
  totalImageSize,
  storedCredentials,
  onDeleteImages,
  onDeleteCredential,
  onAddCredential
}: DataManagementProps) => {
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteImagesConfirm, setShowDeleteImagesConfirm] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and paginate credentials
  const filteredCredentials = useMemo(() => {
    return storedCredentials.filter(cred => 
      cred.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [storedCredentials, searchQuery]);

  const totalPages = Math.ceil(filteredCredentials.length / ITEMS_PER_PAGE);
  const paginatedCredentials = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCredentials.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCredentials, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onAddCredential(newDomain, newUsername, newPassword);
      setIsAddingCredential(false);
      setNewDomain('');
      setNewUsername('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Recipe Images</h3>
                <p className="text-sm text-gray-500">Manage your stored recipe images</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteImagesConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete All
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Total Images</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{imageCount}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Storage Used</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{totalImageSize}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <KeyIcon className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Stored Credentials</h3>
                <p className="text-sm text-gray-500">Manage website login information</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingCredential(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-violet-700 bg-violet-100 hover:bg-violet-200"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
          
          {isAddingCredential && (
            <form onSubmit={handleAddCredential} className="mt-4 space-y-4 border rounded-lg p-4">
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Website Domain
                </label>
                <input
                  type="text"
                  id="domain"
                  required
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingCredential(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adding...' : 'Add Credentials'}
                </button>
              </div>
            </form>
          )}

          {/* Search input */}
          {!isAddingCredential && storedCredentials.length > 0 && (
            <div className="mt-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search credentials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 pl-10 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Credentials list */}
          <div className="mt-4 divide-y divide-gray-200">
            {paginatedCredentials.map((credential) => (
              <div key={credential.id} className="py-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{credential.domain}</h4>
                  <p className="text-sm text-gray-500">{credential.username}</p>
                  <p className="text-xs text-gray-400">
                    Last used: {credential.lastUsed.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setCredentialToDelete(credential.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            {filteredCredentials.length === 0 && !isAddingCredential && (
              <div className="py-4 text-center text-sm text-gray-500">
                {searchQuery 
                  ? 'No credentials match your search'
                  : 'No stored credentials'
                }
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredCredentials.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredCredentials.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === i + 1
                            ? 'z-10 bg-violet-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteImagesConfirm}
        onClose={() => setShowDeleteImagesConfirm(false)}
        onConfirm={onDeleteImages}
        title="Delete All Recipe Images"
        message="Are you sure you want to delete all recipe images? This action cannot be undone."
        confirmText="Delete All"
        isDangerous
      />

      <ConfirmDialog
        isOpen={!!credentialToDelete}
        onClose={() => setCredentialToDelete(null)}
        onConfirm={() => {
          if (credentialToDelete) {
            onDeleteCredential(credentialToDelete);
          }
        }}
        title="Delete Stored Credentials"
        message="Are you sure you want to delete these credentials? You will need to re-enter them to access the website again."
        confirmText="Delete"
        isDangerous
      />
    </div>
  );
}; 