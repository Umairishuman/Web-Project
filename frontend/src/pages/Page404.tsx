import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const Page404 = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-primary-50 text-primary flex items-center justify-center">
          <Compass size={36} />
        </div>
        <p className="mt-6 text-xs font-mono uppercase tracking-widest text-darknavy-500">
          Error 404
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-darknavy tracking-tight">
          Lost in space
        </h1>
        <p className="mt-3 text-darknavy-500">
          The page you're looking for has wandered off. Let's get you back home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home size={16} /> Go home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>
    </div>
  );
};
