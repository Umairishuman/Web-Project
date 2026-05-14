import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border-2 border-dashed border-darknavy-200 bg-white/60">
      <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-4">
        <Icon size={26} />
      </div>
      <h3 className="text-lg font-semibold text-darknavy">{title}</h3>
      {description && (
        <p className="text-sm text-darknavy-500 mt-1 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
