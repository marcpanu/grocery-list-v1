import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  onToggleConfig?: () => void;
  showConfig?: boolean;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  onToggleConfig,
  showConfig,
  actions
}) => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-zinc-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
            {actions}
          </div>
        </div>
      </div>
      {/* Spacer to prevent content from going under the fixed header */}
      <div className="h-[60px]" />
    </>
  );
}; 