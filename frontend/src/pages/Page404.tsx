import { Link } from 'react-router-dom';

export const Page404 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl mb-4">Page Not Found</p>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
          Go Home
        </Link>
      </div>
    </div>
  );
};
