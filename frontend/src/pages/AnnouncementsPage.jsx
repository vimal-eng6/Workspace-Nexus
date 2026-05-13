import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Plus, Clock, User } from 'lucide-react';
import Modal from '../components/Modal';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      await createAnnouncement({
        title: newTitle,
        content: newContent,
        author: user.username,
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      fetchData(); // refresh list
    } catch (err) {
      alert('Failed to post announcement: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-container page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Company Announcements</h1>
          <p className="page-subtitle">Stay up to date with the latest news and updates.</p>
        </div>
        {user?.role?.toLowerCase() === 'admin' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Post Update
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading feed...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <div className="error-icon">!</div>
          {error}
        </div>
      ) : (
        <div className="announcements-feed" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          {announcements.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Megaphone size={48} style={{ opacity: 0.5, margin: '0 auto 15px auto' }} />
              <p>No announcements yet. Be the first to post!</p>
            </div>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className="glass-panel" style={{ padding: '25px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--color-primary)' }}>{item.title}</h3>
                </div>
                
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                  {item.content}
                </p>

                <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} /> Posted by {item.author}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Announcement">
        <form onSubmit={handleCreate} className="booking-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="E.g., Q3 Townhall Meeting"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              rows="5"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What do you want to share with the company?"
              required
            ></textarea>
          </div>
          <div className="form-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
             <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
