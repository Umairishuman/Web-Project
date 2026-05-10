import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'primary' | 'green' | 'blue' | 'amber' | 'violet';
  hint?: string;
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary-50 text-primary-700',
  green: 'bg-green-50 text-green-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
};

export const StatCard = ({ label, value, icon: Icon, accent = 'primary', hint }: StatCardProps) => {
  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-darknavy-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-darknavy tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-darknavy-500">{hint}</p>}
        </div>
        <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};
