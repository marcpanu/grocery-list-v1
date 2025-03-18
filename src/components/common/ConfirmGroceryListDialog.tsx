import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ConfirmGroceryListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  onConfirmAdd: () => void;
}

export const ConfirmGroceryListDialog: React.FC<ConfirmGroceryListDialogProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  onConfirmAdd
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
              className="text-gray-400 hover:text-gray-500"
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmAdd}
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700"
            >
              Add to Existing List
            </button>
            <button
              onClick={onConfirmClear}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700"
            >
              Clear & Add New
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 