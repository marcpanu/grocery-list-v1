import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlank: () => void;
}

export const NewPlanModal: React.FC<NewPlanModalProps> = ({
  isOpen,
  onClose,
  onCreateBlank,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">Create New Meal Plan</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                onCreateBlank();
                onClose();
              }}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-violet-600 hover:bg-violet-50 transition-colors"
            >
              <h3 className="font-medium">Blank Week</h3>
              <p className="text-sm text-gray-500">Start with an empty meal plan</p>
            </button>

            <button
              disabled
              className="w-full p-4 text-left border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
            >
              <h3 className="font-medium">Weekly Template</h3>
              <p className="text-sm text-gray-500">Use a pre-defined template (Coming Soon)</p>
            </button>

            <button
              disabled
              className="w-full p-4 text-left border border-gray-200 rounded-lg opacity-50 cursor-not-allowed"
            >
              <h3 className="font-medium">Copy Previous Week</h3>
              <p className="text-sm text-gray-500">Copy meals from a previous week (Coming Soon)</p>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 