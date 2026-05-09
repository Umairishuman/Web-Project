import { Link } from 'react-router-dom';

export const Page403 = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <p className="text-xl mb-4">Access Denied</p>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <Link to="/dashboard" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};
