import React from 'react';

interface DaySelectorProps {
  selectedDays: string[];
  onChange: (newDays: string[]) => void;
  disabled?: boolean;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onChange,
  disabled = false,
}) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    if (disabled) return;
    
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    onChange(newSelectedDays);
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => toggleDay(day)}
          disabled={disabled}
          className={`p-2 text-xs font-medium rounded ${
            selectedDays.includes(day)
              ? 'bg-violet-100 text-violet-800 border border-violet-300'
              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {day}
        </button>
      ))}
    </div>
  );
}; 