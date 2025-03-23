import { useState, useEffect } from 'react';
import { WeekTemplate } from '../../types/mealPlan';
import { getWeekTemplates, deleteWeekTemplate } from '../../firebase/firestore';
import { toast } from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';

const DEFAULT_USER_ID = 'default';

export const TemplateManager = () => {
  const [templates, setTemplates] = useState<WeekTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const userTemplates = await getWeekTemplates(DEFAULT_USER_ID);
      setTemplates(userTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteWeekTemplate(templateId);
      await loadTemplates(); // Refresh the list
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium text-zinc-900 mb-4">Week Templates</h2>
      
      {templates.length === 0 ? (
        <div className="text-center py-6 text-zinc-500">
          No templates found. Create templates from the meal planning page.
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-zinc-200"
            >
              <div>
                <h3 className="text-sm font-medium text-zinc-900">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-zinc-500 mt-1">{template.description}</p>
                )}
                <p className="text-xs text-zinc-400 mt-1">
                  {template.meals.length} meal{template.meals.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                title="Delete template"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 