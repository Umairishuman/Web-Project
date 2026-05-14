import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const Page403 = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center">
          <ShieldAlert size={36} />
        </div>
        <p className="mt-6 text-xs font-mono uppercase tracking-widest text-darknavy-500">
          Error 403
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-darknavy tracking-tight">
          Access denied
        </h1>
        <p className="mt-3 text-darknavy-500">
          You don't have permission to view this page. If you think this is a mistake,
          contact your administrator.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary">
            <Home size={16} /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>
    </div>
  );
};
