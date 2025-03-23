import React, { useState } from 'react';
import { PageHeader } from './PageHeader';

export const Browser: React.FC = () => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = `https://${url}`;
    }
    window.open(processedUrl, '_blank', 'width=1024,height=800,menubar=yes,toolbar=yes,location=yes,status=yes');
  };

  return (
    <>
      <PageHeader 
        title="Recipe Browser" 
        actions={
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter recipe URL..."
                className="w-full px-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-sm text-white bg-violet-600 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                Open
              </button>
            </div>
          </form>
        }
      />
      <div className="flex-1 bg-white p-4">
        <div className="w-full h-full flex items-center justify-center text-zinc-500">
          Enter a URL to open the recipe in a new window
        </div>
      </div>
    </>
  );
}; 