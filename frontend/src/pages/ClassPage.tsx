import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../hooks/useToast';

interface Announcement {
  _id: string;
  content: string;
  isAnonymous: boolean;
  authorId: { name: string };
  createdAt: string;
  comments: Comment[];
}

interface Comment {
  _id: string;
  content: string;
  isAnonymous: boolean;
  authorId: { name: string };
  createdAt: string;
}

export const ClassPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const fetchClassData = async () => {
    try {
      const response = await api.get(`/classes/${id}`);
      if (response.data.success) {
        setClassData(response.data.data.class);
        setAnnouncements(response.data.data.announcements);
      }
    } catch (error) {
      showToast('Failed to fetch class data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(`/classes/${id}/announcements`, {
        content: newAnnouncement,
        isAnonymous: false,
      });
      if (response.data.success) {
        showToast('Announcement created', 'success');
        setNewAnnouncement('');
        setShowAnnouncementForm(false);
        fetchClassData();
      }
    } catch (error) {
      showToast('Failed to create announcement', 'error');
    }
  };

  const handleAddComment = async (annId: string, comment: string) => {
    try {
      const response = await api.post(`/classes/${id}/announcements/${annId}/comments`, {
        content: comment,
        isAnonymous: false,
      });
      if (response.data.success) {
        showToast('Comment added', 'success');
        fetchClassData();
      }
    } catch (error) {
      showToast('Failed to add comment', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-darknavy">{classData?.name}</h1>
        <p className="text-gray-600">{classData?.subject}</p>
        <p className="text-gray-500 mt-2">{classData?.description}</p>
      </div>

      {user?.role === 'teacher' && (
        <div className="mb-6">
          <button
            onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
          >
            {showAnnouncementForm ? 'Cancel' : 'Post Announcement'}
          </button>
        </div>
      )}

      {showAnnouncementForm && (
        <form onSubmit={handleCreateAnnouncement} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <textarea
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Write an announcement..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            rows={4}
            required
          />
          <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
            Post
          </button>
        </form>
      )}

      <div className="space-y-6">
        {announcements.map((ann) => (
          <div key={ann._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold">{ann.isAnonymous ? 'Anonymous' : ann.authorId.name}</span>
              <span className="text-gray-500 text-sm">{new Date(ann.createdAt).toLocaleString()}</span>
            </div>
            <p className="mb-4">{ann.content}</p>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Comments</h4>
              <div className="space-y-2 mb-4">
                {ann.comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-sm">{comment.isAnonymous ? 'Anonymous' : comment.authorId.name}</span>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const comment = (e.target as HTMLFormElement).comment.value;
                  handleAddComment(ann._id, comment);
                  (e.target as HTMLFormElement).reset();
                }}
                className="flex gap-2"
              >
                <input
                  name="comment"
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition">
                  Reply
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
