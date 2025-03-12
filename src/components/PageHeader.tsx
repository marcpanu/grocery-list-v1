interface PageHeaderProps {
  title: string;
  onToggleConfig?: () => void;
  showConfig?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  onToggleConfig,
  showConfig 
}) => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-zinc-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
            {onToggleConfig && (
              <button
                onClick={onToggleConfig}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-50"
              >
                <span>View Options</span>
                <svg className={`w-5 h-5 transition-transform ${showConfig ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Spacer to prevent content from going under the fixed header */}
      <div className="h-[60px]" />
    </>
  );
}; 