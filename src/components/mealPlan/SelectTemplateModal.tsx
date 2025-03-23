import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WeekTemplate, TemplateApplicationMode } from '../../types/mealPlan';

interface SelectTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string, mode: TemplateApplicationMode) => void;
  templates: WeekTemplate[];
  existingMealsCount?: number;
  isLoading?: boolean;
}

export const SelectTemplateModal: React.FC<SelectTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  templates,
  existingMealsCount = 0,
  isLoading = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mode, setMode] = useState<TemplateApplicationMode>('replace');
  const [error, setError] = useState<string | null>(null);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(null);
      setMode('replace');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }
    
    onSelect(selectedTemplate, mode);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Select Week Template
            </Dialog.Title>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-500"
              disabled={isLoading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                No templates available. Create a template by saving a week's meal plan.
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      if (error) setError(null);
                    }}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <h3 className="font-medium">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-zinc-500 mt-1">{template.description}</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-2">
                      {template.meals.length} meal{template.meals.length !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {existingMealsCount > 0 && selectedTemplate && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">
                  This week already has {existingMealsCount} meal{existingMealsCount !== 1 ? 's' : ''}
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="mode"
                      value="replace"
                      checked={mode === 'replace'}
                      onChange={e => setMode(e.target.value as TemplateApplicationMode)}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>Replace existing meals</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="mode"
                      value="merge"
                      checked={mode === 'merge'}
                      onChange={e => setMode(e.target.value as TemplateApplicationMode)}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>Add template meals to existing meals</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
                  isLoading || templates.length === 0
                    ? 'bg-violet-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
                disabled={isLoading || templates.length === 0}
              >
                {isLoading ? 'Applying...' : 'Apply Template'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 