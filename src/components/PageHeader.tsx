interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <div className="px-4 py-6 bg-white border-b border-zinc-200">
      <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
    </div>
  );
}; 