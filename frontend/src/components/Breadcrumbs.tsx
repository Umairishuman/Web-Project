import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-darknavy-500">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary transition-colors">
            <Home size={14} />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-darknavy-300" />
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-primary transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className="text-darknavy-700 font-medium">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
