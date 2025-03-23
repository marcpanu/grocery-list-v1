import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SelectTemplateModal } from './SelectTemplateModal';
import { WeekTemplate, TemplateApplicationMode } from '../../types/mealPlan';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlank: () => void;
  onCreateFromTemplate: (templateId: string) => void;
  templates: WeekTemplate[];
  isLoading?: boolean;
}

export const NewPlanModal: React.FC<NewPlanModalProps> = ({
  isOpen,
  onClose,
  onCreateBlank,
  onCreateFromTemplate,
  templates,
  isLoading = false
}) => {
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);

  const handleTemplateSelect = (templateId: string, mode: TemplateApplicationMode) => {
    setIsSelectTemplateOpen(false);
    onCreateFromTemplate(templateId);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold">Create New Week</Dialog.Title>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-500">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  onCreateBlank();
                  onClose();
                }}
                className="w-full p-4 text-left border border-zinc-200 rounded-lg hover:border-violet-600 hover:bg-violet-50 transition-colors"
                disabled={isLoading}
              >
                <h3 className="font-medium">Blank Week</h3>
                <p className="text-sm text-zinc-500">Start with an empty meal plan</p>
              </button>

              <button
                onClick={() => {
                  setIsSelectTemplateOpen(true);
                  onClose();
                }}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  templates.length === 0
                    ? 'border-zinc-200 opacity-50 cursor-not-allowed'
                    : 'border-zinc-200 hover:border-violet-600 hover:bg-violet-50'
                }`}
                disabled={templates.length === 0 || isLoading}
              >
                <h3 className="font-medium">Weekly Template</h3>
                <p className="text-sm text-zinc-500">
                  {templates.length === 0
                    ? 'No templates available yet'
                    : `Use one of your ${templates.length} saved templates`}
                </p>
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

      <SelectTemplateModal
        isOpen={isSelectTemplateOpen}
        onClose={() => setIsSelectTemplateOpen(false)}
        onSelect={handleTemplateSelect}
        templates={templates}
        isLoading={isLoading}
      />
    </>
  );
}; 