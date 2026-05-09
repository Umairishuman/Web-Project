import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

export const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats();
    } else {
      fetchUserStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      showToast('Failed to fetch stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const endpoint = user?.role === 'teacher' ? '/classes' : '/classes/student/my';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setStats({ classes: response.data.data.classes?.length || 0 });
      }
    } catch (error) {
      showToast('Failed to fetch stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-darknavy mb-6">
        {user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
      </h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.name}</p>

      {user?.role === 'admin' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
            <p className="text-3xl font-bold text-green-500">{stats?.activeUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total Classes</h3>
            <p className="text-3xl font-bold text-blue-500">{stats?.totalClasses || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Total Quizzes</h3>
            <p className="text-3xl font-bold text-purple-500">{stats?.totalQuizzes || 0}</p>
          </div>
        </div>
      )}

      {user?.role !== 'admin' && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Enrolled Classes</h3>
            <p className="text-3xl font-bold text-primary">{stats?.classes || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Quizzes Attempted</h3>
            <p className="text-3xl font-bold text-blue-500">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm font-medium">Average Score</h3>
            <p className="text-3xl font-bold text-green-500">-</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-darknavy mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          {user?.role === 'teacher' && (
            <a href="/classes" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              Manage Classes
            </a>
          )}
          {user?.role === 'teacher' && (
            <a href="/quiz/create" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              Create Quiz
            </a>
          )}
          {user?.role === 'student' && (
            <a href="/classes" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              My Classes
            </a>
          )}
          {user?.role === 'admin' && (
            <a href="/admin/users" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              Manage Users
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
