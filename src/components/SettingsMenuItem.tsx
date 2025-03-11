interface SettingsMenuItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
}

export const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({
  icon,
  title,
  description,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-4 flex items-center gap-4 text-left hover:bg-zinc-50 focus:outline-none focus:bg-zinc-50"
    >
      <div className="flex-shrink-0 w-6 h-6 text-violet-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-medium text-zinc-900">{title}</div>
        {description && (
          <div className="text-sm text-zinc-500">{description}</div>
        )}
      </div>
      <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}; 