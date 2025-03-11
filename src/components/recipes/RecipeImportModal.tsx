import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  GlobeAltIcon, 
  CameraIcon, 
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  InstagramLogoIcon, 
  VideoIcon 
} from '@radix-ui/react-icons';

interface ImportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
}

const importOptions: ImportOption[] = [
  {
    id: 'url',
    name: 'Import from URL',
    description: 'Import a recipe from any website',
    icon: GlobeAltIcon,
    color: 'text-blue-500',
    enabled: true
  },
  {
    id: 'instagram',
    name: 'Import from Instagram',
    description: 'Import from an Instagram post or reel',
    icon: InstagramLogoIcon,
    color: 'text-pink-500',
    enabled: false
  },
  {
    id: 'tiktok',
    name: 'Import from TikTok',
    description: 'Import from a TikTok video',
    icon: VideoIcon,
    color: 'text-black',
    enabled: false
  },
  {
    id: 'image',
    name: 'Import from Picture',
    description: 'Upload a picture of a recipe',
    icon: CameraIcon,
    color: 'text-green-500',
    enabled: false
  },
  {
    id: 'manual',
    name: 'Manual Input',
    description: 'Create a recipe from scratch',
    icon: PencilSquareIcon,
    color: 'text-violet-500',
    enabled: true
  }
];

interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (optionId: string) => void;
}

export const RecipeImportModal = ({ isOpen, onClose, onSelectOption }: RecipeImportModalProps) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div>
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    Add New Recipe
                  </Dialog.Title>
                  
                  <div className="space-y-3">
                    {importOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          if (option.enabled) {
                            onSelectOption(option.id);
                            onClose();
                          }
                        }}
                        disabled={!option.enabled}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-colors ${
                          option.enabled
                            ? 'hover:border-violet-500 hover:bg-violet-50'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <option.icon className={`h-6 w-6 ${option.color}`} />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {option.name}
                            {!option.enabled && <span className="ml-2 text-xs text-gray-500">(Coming soon)</span>}
                          </h4>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 