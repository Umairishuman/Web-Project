import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-darknavy text-white sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          ExamGuard
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-primary transition">Admin</Link>
              )}
              {user?.role === 'teacher' && (
                <>
                  <Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link>
                  <Link to="/classes" className="hover:text-primary transition">My Classes</Link>
                </>
              )}
              {user?.role === 'student' && (
                <>
                  <Link to="/dashboard" className="hover:text-primary transition">Dashboard</Link>
                  <Link to="/classes" className="hover:text-primary transition">My Classes</Link>
                  <Link to="/results" className="hover:text-primary transition">My Results</Link>
                </>
              )}
              <button
                onClick={logout}
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary transition">Login</Link>
              <Link to="/register" className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
