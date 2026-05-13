import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getKTLibrary } from '../api/services';
import {
  Lightbulb,
  Search,
  BookOpen,
  Calendar,
  User,
  DoorOpen,
  Loader2,
  FileText,
} from 'lucide-react';

export default function KTLibraryPage() {
  const { user } = useAuth();
  const [ktSessions, setKtSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadKTFiles();
  }, []);

  const loadKTFiles = async () => {
    setLoading(true);
    try {
      const data = await getKTLibrary(user.division);
      setKtSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load KT library:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = ktSessions.filter((session) =>
    (session.kt_topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.kt_notes || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BookOpen size={28} /> Knowledge Transfer Library
          </h1>
          <p className="page-desc">
            Exclusive resource for the <strong>{user?.division}</strong> division
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="library-controls card">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by topic or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={42} className="spin" />
          <p>Indexing division resources...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} />
          <h3>No KT materials found</h3>
          <p>
            {searchTerm
              ? `No results matching "${searchTerm}"`
              : `Your division hasn't archived any KT sessions yet.`}
          </p>
        </div>
      ) : (
        <div className="kt-grid">
          {filteredSessions.map((session) => (
            <div key={session.id} className="card kt-card">
              <div className="kt-card-icon">
                <Lightbulb size={24} />
              </div>
              <div className="kt-card-content">
                <h3 className="kt-title">{session.kt_topic || 'Untitled Session'}</h3>
                <div className="kt-meta">
                  <div className="kt-meta-item">
                    <User size={14} />
                    <span>{session.username}</span>
                  </div>
                  <div className="kt-meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(session.start_time)}</span>
                  </div>
                  <div className="kt-meta-item">
                    <DoorOpen size={14} />
                    <span>{session.room_name || `Room ${session.room_id}`}</span>
                  </div>
                </div>
                {session.kt_notes && (
                  <div className="kt-notes-preview">
                    <p>{session.kt_notes}</p>
                  </div>
                )}
                <div className="kt-card-footer">
                   <span className="division-tag">{session.division} Exclusive</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
