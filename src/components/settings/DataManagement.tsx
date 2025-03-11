import { useState } from 'react';
import { 
  PhotoIcon, 
  KeyIcon, 
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

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
              onClick={onDeleteImages}
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

          <div className="mt-4 divide-y divide-gray-200">
            {storedCredentials.map((credential) => (
              <div key={credential.id} className="py-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{credential.domain}</h4>
                  <p className="text-sm text-gray-500">{credential.username}</p>
                  <p className="text-xs text-gray-400">
                    Last used: {credential.lastUsed.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteCredential(credential.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            {storedCredentials.length === 0 && !isAddingCredential && (
              <div className="py-4 text-center text-sm text-gray-500">
                No stored credentials
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 