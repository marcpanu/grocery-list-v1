import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WeekTemplate, Week } from '../../types/mealPlan';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromPreviousWeek: (weekId: string) => void;
  onCreateFromTemplate: (templateId: string) => void;
  templates: WeekTemplate[];
  previousWeeks: Week[];
  isLoading?: boolean;
}

export const NewPlanModal: React.FC<NewPlanModalProps> = ({
  isOpen,
  onClose,
  onCreateFromPreviousWeek,
  onCreateFromTemplate,
  templates,
  previousWeeks,
  isLoading = false
}) => {
  const [selectedOption, setSelectedOption] = useState<'previous' | 'template'>('previous');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption === 'previous' && selectedWeek) {
      onCreateFromPreviousWeek(selectedWeek);
    } else if (selectedOption === 'template' && selectedTemplate) {
      onCreateFromTemplate(selectedTemplate);
    }
    onClose();
  };

  return (
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="previous"
                  name="weekType"
                  value="previous"
                  checked={selectedOption === 'previous'}
                  onChange={(e) => setSelectedOption('previous')}
                  className="text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="previous" className="text-sm font-medium text-gray-700">
                  Previous Week
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="template"
                  name="weekType"
                  value="template"
                  checked={selectedOption === 'template'}
                  onChange={(e) => setSelectedOption('template')}
                  className="text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="template" className="text-sm font-medium text-gray-700">
                  From Template
                </label>
              </div>
            </div>

            {selectedOption === 'previous' && (
              <div className="mt-2">
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm rounded-md"
                  disabled={isLoading}
                >
                  <option value="">Select a week</option>
                  {previousWeeks.map((week) => {
                    const startDate = new Date(week.startDate);
                    const endDate = new Date(week.endDate);
                    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <option key={week.id} value={week.id}>
                        {formatDate(startDate)} - {formatDate(endDate)}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {selectedOption === 'template' && (
              <div className="mt-2">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm rounded-md"
                  disabled={isLoading}
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                disabled={(selectedOption === 'template' && !selectedTemplate) || 
                         (selectedOption === 'previous' && !selectedWeek)}
              >
                Create
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 