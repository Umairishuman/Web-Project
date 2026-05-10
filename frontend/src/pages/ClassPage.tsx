import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Megaphone,
  MessageSquare,
  Send,
  Users as UsersIcon,
  EyeOff,
  Copy,
  Check,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  Pencil,
  ListChecks,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';
import { PageHeader } from '../components/PageHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface Announcement {
  _id: string;
  content: string;
  isAnonymous: boolean;
  authorId: { name: string };
  createdAt: string;
  comments: CommentItem[];
}

interface CommentItem {
  _id: string;
  content: string;
  isAnonymous: boolean;
  authorId: { name: string };
  createdAt: string;
}

interface QuizSummary {
  _id: string;
  title: string;
  status: 'draft' | 'published';
  scheduledAt: string;
  closesAt: string;
  timeLimit: number;
}

export const ClassPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [tab, setTab] = useState<'announcements' | 'quizzes'>('announcements');
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAll = async () => {
    try {
      const [classResp, quizResp] = await Promise.allSettled([
        api.get(`/classes/${id}`),
        api.get(`/quizzes/class/${id}`),
      ]);
      if (classResp.status === 'fulfilled' && classResp.value.data.success) {
        setClassData(classResp.value.data.data.class);
        setAnnouncements(classResp.value.data.data.announcements || []);
      }
      if (quizResp.status === 'fulfilled' && quizResp.value.data.success) {
        setQuizzes(quizResp.value.data.data.quizzes || []);
      }
    } catch {
      showToast('Failed to fetch class data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      const response = await api.post(`/classes/${id}/announcements`, {
        content: newAnnouncement,
        isAnonymous: postAnonymous,
      });
      if (response.data.success) {
        showToast('Announcement posted', 'success');
        setNewAnnouncement('');
        setPostAnonymous(false);
        setShowAnnouncementForm(false);
        fetchAll();
      }
    } catch {
      showToast('Failed to create announcement', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleAddComment = async (annId: string, content: string, isAnonymous: boolean) => {
    try {
      const response = await api.post(`/classes/${id}/announcements/${annId}/comments`, {
        content,
        isAnonymous,
      });
      if (response.data.success) {
        showToast('Comment added', 'success');
        fetchAll();
      }
    } catch {
      showToast('Failed to add comment', 'error');
    }
  };

  const copyCode = () => {
    if (!classData?.joinCode) return;
    navigator.clipboard.writeText(classData.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <PageHeader
        breadcrumbs={[
          { label: 'My Classes', to: '/classes' },
          { label: classData?.name || 'Class' },
        ]}
        title={classData?.name || 'Class'}
        subtitle={
          classData?.description ||
          `${classData?.subject || 'Course'} · stay updated and take quizzes here.`
        }
        actions={
          user?.role === 'teacher' && (
            <Link to="/quiz/create" className="btn-primary">
              <Plus size={16} /> New Quiz
            </Link>
          )
        }
      />

      {/* Class info bar */}
      <div className="card p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="badge-primary capitalize">{classData?.subject}</span>
          {user?.role === 'teacher' && classData?.joinCode && (
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-darknavy-50 hover:bg-darknavy-100 text-sm font-medium transition-colors"
            >
              <span className="text-darknavy-500">Code:</span>
              <span className="font-mono tracking-widest text-darknavy">{classData.joinCode}</span>
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-darknavy-500">
          <span className="inline-flex items-center gap-1.5"><Megaphone size={14} /> {announcements.length} posts</span>
          <span className="inline-flex items-center gap-1.5"><FileText size={14} /> {quizzes.length} quizzes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-darknavy-200 mb-6">
        <nav className="flex gap-1">
          {([
            { key: 'announcements', label: 'Announcements', icon: Megaphone },
            { key: 'quizzes', label: 'Quizzes', icon: FileText },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-darknavy-500 hover:text-darknavy'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'announcements' ? (
        <div>
          {user?.role === 'teacher' && (
            <div className="mb-5">
              {!showAnnouncementForm ? (
                <button onClick={() => setShowAnnouncementForm(true)} className="btn-secondary">
                  <Pencil size={16} /> Post announcement
                </button>
              ) : (
                <form onSubmit={handleCreateAnnouncement} className="card p-5">
                  <textarea
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Share an update with your class..."
                    className="input"
                    rows={4}
                    required
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-darknavy-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postAnonymous}
                        onChange={(e) => setPostAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded border-darknavy-300 text-primary"
                      />
                      <EyeOff size={14} /> Post anonymously
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAnnouncementForm(false);
                          setNewAnnouncement('');
                        }}
                        className="btn-ghost"
                      >
                        Cancel
                      </button>
                      <button type="submit" disabled={posting} className="btn-primary">
                        {posting ? <><Loader2 size={14} className="animate-spin" /> Posting</> : <><Send size={14} /> Post</>}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {announcements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description={
                user?.role === 'teacher'
                  ? 'Post your first announcement to keep students informed.'
                  : 'Your teacher hasn\'t posted any announcements yet.'
              }
            />
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <article key={ann._id} className="card p-6">
                  <header className="flex items-center gap-3">
                    {ann.isAnonymous ? (
                      <div className="w-10 h-10 rounded-full bg-darknavy-100 text-darknavy-500 flex items-center justify-center">
                        <EyeOff size={16} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center text-sm font-bold">
                        {ann.authorId?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-darknavy text-sm">
                        {ann.isAnonymous ? 'Anonymous' : ann.authorId?.name}
                      </p>
                      <p className="text-xs text-darknavy-500">
                        {new Date(ann.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </header>
                  <p className="mt-4 text-darknavy-700 whitespace-pre-wrap leading-relaxed">
                    {ann.content}
                  </p>

                  <div className="mt-5 pt-5 border-t border-darknavy-100">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-darknavy-500 flex items-center gap-1.5">
                      <MessageSquare size={12} /> Comments ({ann.comments.length})
                    </h4>
                    <div className="mt-3 space-y-2">
                      {ann.comments.map((c) => (
                        <div
                          key={c._id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-darknavy-50"
                        >
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-bold text-darknavy">
                            {c.isAnonymous ? <EyeOff size={12} /> : c.authorId?.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-darknavy">
                              {c.isAnonymous ? 'Anonymous' : c.authorId?.name}
                            </p>
                            <p className="text-sm text-darknavy-700">{c.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <CommentForm onSubmit={(content, anon) => handleAddComment(ann._id, content, anon)} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {quizzes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No quizzes yet"
              description={
                user?.role === 'teacher'
                  ? 'Create your first quiz for this class — drafts and scheduled quizzes will show up here.'
                  : 'Your teacher hasn\'t published any quizzes yet. Check back soon.'
              }
              action={
                user?.role === 'teacher' && (
                  <Link to="/quiz/create" className="btn-primary">
                    <Plus size={16} /> Create quiz
                  </Link>
                )
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {quizzes.map((q) => {
                const now = new Date();
                const opens = new Date(q.scheduledAt);
                const closes = new Date(q.closesAt);
                let status: { label: string; className: string };
                if (q.status === 'draft') status = { label: 'Draft', className: 'badge-neutral' };
                else if (now < opens) status = { label: 'Scheduled', className: 'badge-warning' };
                else if (now > closes) status = { label: 'Closed', className: 'badge-error' };
                else status = { label: 'Live', className: 'badge-success' };

                return (
                  <div key={q._id} className="card p-5 card-hover">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-darknavy truncate">{q.title}</h3>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-darknavy-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} /> {q.timeLimit} min
                          </span>
                          <span>Opens {opens.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={status.className}>{status.label}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-darknavy-500">
                        Closes {closes.toLocaleString()}
                      </span>
                      {user?.role === 'student' ? (
                        status.label === 'Live' ? (
                          <Link to={`/quiz/${q._id}`} className="btn-primary btn-sm">
                            <ListChecks size={14} /> Attempt <ArrowRight size={12} />
                          </Link>
                        ) : (
                          <span className="text-xs text-darknavy-400">Not available</span>
                        )
                      ) : (
                        <div className="flex gap-2">
                          <Link to={`/quiz/${q._id}/edit`} className="btn-ghost btn-sm">
                            <Pencil size={12} /> Edit
                          </Link>
                          <Link to={`/quiz/${q._id}/results`} className="btn-secondary btn-sm">
                            Results
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentForm = ({
  onSubmit,
}: {
  onSubmit: (content: string, isAnonymous: boolean) => void;
}) => {
  const [text, setText] = useState('');
  const [anon, setAnon] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text.trim(), anon);
        setText('');
        setAnon(false);
      }}
      className="mt-3"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="input flex-1"
          required
        />
        <button type="submit" className="btn-primary">
          <Send size={14} /> Reply
        </button>
      </div>
      <label className="mt-2 inline-flex items-center gap-2 text-xs text-darknavy-500 cursor-pointer">
        <input
          type="checkbox"
          checked={anon}
          onChange={(e) => setAnon(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-darknavy-300 text-primary"
        />
        Reply anonymously
      </label>
    </form>
  );
};

// Suppress unused warning in TS strict
void UsersIcon;
