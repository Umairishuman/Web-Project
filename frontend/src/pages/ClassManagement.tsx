import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  GraduationCap,
  Loader2,
  X,
  Copy,
  Check,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface ClassItem {
  _id: string;
  name: string;
  subject: string;
  description: string;
  joinCode: string;
  createdAt: string;
}

export const ClassManagement = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', subject: '', description: '' });
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClasses = async () => {
    try {
      const endpoint = user?.role === 'teacher' ? '/classes' : '/classes/student/my';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setClasses(response.data.data.classes);
      }
    } catch {
      showToast('Failed to fetch classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
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
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const joinCode = (form.elements.namedItem('joinCode') as HTMLInputElement).value;
    setJoining(true);
    try {
      const response = await api.post('/classes/join', { joinCode });
      if (response.data.success) {
        showToast('Joined class successfully', 'success');
        form.reset();
        fetchClasses();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to join class', 'error');
    } finally {
      setJoining(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return <LoadingSpinner />;

  const subjectGradient = (subject: string) => {
    const palette = [
      'from-primary-500 to-primary-700',
      'from-blue-500 to-indigo-600',
      'from-violet-500 to-purple-700',
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-700',
    ];
    let hash = 0;
    for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[{ label: 'My Classes' }]}
        title="My Classes"
        subtitle={
          user?.role === 'teacher'
            ? 'Create classes, share join codes, and manage students.'
            : 'Join your classes and start attempting quizzes.'
        }
        actions={
          user?.role === 'teacher' ? (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus size={16} /> Create class
            </button>
          ) : null
        }
      />

      {user?.role === 'student' && (
        <form onSubmit={handleJoin} className="card p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
              <KeyRound size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-darknavy">Join a class</h3>
              <p className="text-sm text-darknavy-500 mt-0.5">
                Enter the 6-character code your teacher shared with you.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  name="joinCode"
                  type="text"
                  placeholder="e.g. AB12CD"
                  className="input sm:max-w-xs font-mono uppercase tracking-widest"
                  maxLength={6}
                  required
                />
                <button type="submit" disabled={joining} className="btn-primary">
                  {joining ? <><Loader2 size={16} className="animate-spin" /> Joining</> : 'Join class'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={user?.role === 'teacher' ? 'No classes yet' : 'You haven\'t joined a class yet'}
          description={
            user?.role === 'teacher'
              ? 'Create your first class — students can join with the auto-generated code.'
              : 'Use the join code your teacher shared above to enroll.'
          }
          action={
            user?.role === 'teacher' && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus size={16} /> Create class
              </button>
            )
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="card overflow-hidden card-hover cursor-pointer group"
              onClick={() => navigate(`/class/${cls._id}`)}
            >
              <div className={`h-24 bg-gradient-to-br ${subjectGradient(cls.subject)} relative`}>
                <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
                <div className="absolute bottom-3 left-5 text-white">
                  <p className="text-xs uppercase tracking-wider opacity-80">{cls.subject}</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-darknavy text-lg leading-tight">{cls.name}</h3>
                {cls.description && (
                  <p className="mt-1.5 text-sm text-darknavy-500 line-clamp-2">{cls.description}</p>
                )}

                {user?.role === 'teacher' && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(cls.joinCode);
                    }}
                    className="mt-4 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-darknavy-50 hover:bg-darknavy-100 transition-colors"
                  >
                    <span className="text-xs text-darknavy-500">Join code</span>
                    <span className="font-mono font-bold tracking-widest text-darknavy">{cls.joinCode}</span>
                    <button
                      type="button"
                      className="p-1 text-darknavy-500 hover:text-primary"
                      aria-label="Copy code"
                    >
                      {copiedCode === cls.joinCode ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-darknavy-500">
                    {new Date(cls.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                    Open <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-darknavy/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card w-full max-w-md p-7 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="font-bold text-darknavy text-lg">Create new class</h2>
                <p className="text-sm text-darknavy-500">A 6-character join code will be auto-generated.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-darknavy-400 hover:text-darknavy hover:bg-darknavy-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 mt-5">
              <div>
                <label className="label">Class name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Algorithms — Spring 2026"
                  required
                />
              </div>
              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  placeholder="Optional course description..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? <><Loader2 size={16} className="animate-spin" /> Creating</> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
