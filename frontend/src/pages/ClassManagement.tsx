import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { Plus } from 'lucide-react';

interface Class {
  _id: string;
  name: string;
  subject: string;
  description: string;
  joinCode: string;
  createdAt: string;
}

export const ClassManagement = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', subject: '', description: '' });
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const endpoint = user?.role === 'teacher' ? '/classes' : '/classes/student/my';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setClasses(response.data.data.classes);
      }
    } catch (error) {
      showToast('Failed to fetch classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/classes', formData);
      if (response.data.success) {
        showToast('Class created successfully', 'success');
        setShowCreateModal(false);
        setFormData({ name: '', subject: '', description: '' });
        fetchClasses();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create class', 'error');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinCode = (e.target as HTMLFormElement).joinCode.value;
    try {
      const response = await api.post('/classes/join', { joinCode });
      if (response.data.success) {
        showToast('Joined class successfully', 'success');
        fetchClasses();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to join class', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-darknavy">
          {user?.role === 'teacher' ? 'My Classes' : 'My Classes'}
        </h1>
        {user?.role === 'teacher' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
          >
            <Plus size={20} />
            Create Class
          </button>
        )}
      </div>

      {user?.role === 'student' && (
        <form onSubmit={handleJoin} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-bold mb-4">Join a Class</h3>
          <div className="flex gap-4">
            <input
              name="joinCode"
              type="text"
              placeholder="Enter join code"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
              Join
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div
            key={cls._id}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/class/${cls._id}`)}
          >
            <h3 className="text-xl font-bold text-darknavy mb-2">{cls.name}</h3>
            <p className="text-gray-600 mb-2">{cls.subject}</p>
            <p className="text-sm text-gray-500">{cls.description}</p>
            {user?.role === 'teacher' && (
              <p className="text-sm text-primary mt-4">Join Code: {cls.joinCode}</p>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create Class</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
