import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WeekTemplate, Week } from '../../types/mealPlan';

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromPreviousWeek: (weekId: string, shouldOverwrite: boolean) => void;
  onCreateFromTemplate: (templateId: string, shouldOverwrite: boolean) => void;
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirm = (shouldOverwrite: boolean) => {
    if (selectedOption === 'previous' && selectedWeek) {
      onCreateFromPreviousWeek(selectedWeek, shouldOverwrite);
    } else if (selectedOption === 'template' && selectedTemplate) {
      onCreateFromTemplate(selectedTemplate, shouldOverwrite);
    }
    setShowConfirmDialog(false);
    onClose();
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
                    {previousWeeks
                      .filter(week => {
                        // Parse the end date of the week
                        const endParts = week.endDate.split('-').map(Number);
                        const weekEnd = new Date(endParts[0], endParts[1] - 1, endParts[2]);
                        
                        // Get today's date at the start of the day
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Return true only for weeks that ended before today
                        return weekEnd < today;
                      })
                      .map((week) => {
                        // Parse dates using YYYY-MM-DD format to avoid timezone issues
                        const startParts = week.startDate.split('-').map(Number);
                        const endParts = week.endDate.split('-').map(Number);
                        
                        // Create date objects with local timezone (months are 0-indexed in JS Date)
                        const weekStart = new Date(startParts[0], startParts[1] - 1, startParts[2]);
                        const weekEnd = new Date(endParts[0], endParts[1] - 1, endParts[2]);
                        
                        // Format the dates for display
                        const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        return (
                          <option key={week.id} value={week.id}>
                            {formatDate(weekStart)} - {formatDate(weekEnd)}
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-semibold mb-4">
              How would you like to add these meals?
            </Dialog.Title>

            <div className="space-y-4">
              <button
                onClick={() => handleConfirm(true)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Overwrite Existing Week
              </button>
              
              <button
                onClick={() => handleConfirm(false)}
                className="w-full px-4 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-md hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Add to Existing Week
              </button>

              <button
                onClick={() => setShowConfirmDialog(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}; 