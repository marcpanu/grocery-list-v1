import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ConfirmGroceryListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  onConfirmAdd: () => void;
  isLoading?: boolean;
}

export const ConfirmGroceryListDialog: React.FC<ConfirmGroceryListDialogProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  onConfirmAdd,
  isLoading = false
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!isLoading) {
          onClose();
        }
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <ShoppingCartIcon className="h-5 w-5 text-violet-600" />
              <span>Add to Grocery List</span>
            </Dialog.Title>
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`text-gray-400 ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-500'}`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Your grocery list already has items. Would you like to:
            </p>
            
            <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
              <li>Clear your current list and add these new ingredients?</li>
              <li>Add these ingredients to your existing list?</li>
            </ul>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md 
                ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirmAdd}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md 
                ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-violet-700'}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Add to Existing List"}
            </button>
            <button
              onClick={onConfirmClear}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md 
                ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-amber-700'}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Clear & Add New"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 