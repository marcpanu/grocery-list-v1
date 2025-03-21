import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createOrGetWeek } from '../../firebase/firestore';

interface AddWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeekAdded: () => void;
  userId: string;
  existingWeeks: { startDate: string; endDate: string }[];
}

export const AddWeekModal: React.FC<AddWeekModalProps> = ({
  isOpen,
  onClose,
  onWeekAdded,
  userId,
  existingWeeks
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Calculate the start date of next week
      const nextWeekDate = new Date();
      nextWeekDate.setDate(nextWeekDate.getDate() + (7 - nextWeekDate.getDay()));
      setSelectedDate(nextWeekDate);
      setError(null);
    }
  }, [isOpen]);

  const handleAddWeek = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await createOrGetWeek(userId, selectedDate);
      onWeekAdded();
      onClose();
    } catch (error) {
      console.error('Failed to create week:', error);
      setError('Failed to create week. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDateAlreadyInWeek = (date: Date): boolean => {
    if (!date || !existingWeeks) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if the selected date falls within any existing week
    return existingWeeks.some(week => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);
      const selectedDateObj = new Date(dateStr);
      
      return selectedDateObj >= startDate && selectedDateObj <= endDate;
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Add New Week
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Select a date for the new week
              </label>
              <div className="w-full">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => setSelectedDate(date)}
                  highlightDates={[new Date()]}
                  calendarClassName="border border-zinc-200 rounded-md"
                  className="w-full rounded-md border border-zinc-300 p-2 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select a date"
                />
              </div>
              {selectedDate && isDateAlreadyInWeek(selectedDate) && (
                <p className="mt-1 text-xs text-amber-600">
                  This date is already part of an existing week. You can still create it, but it may overlap with existing data.
                </p>
              )}
              <p className="mt-2 text-xs text-zinc-500">
                Selecting any date will create a week starting on Sunday and ending on Saturday that includes the selected date.
              </p>
            </div>

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
                type="button"
                onClick={handleAddWeek}
                className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
                  isLoading
                    ? 'bg-violet-400 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Add Week'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 