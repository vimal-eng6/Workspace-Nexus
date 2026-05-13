import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead } from '../api/services';
import { Mail, MailOpen, Clock, Loader2, Inbox, Trash2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function MailboxPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (user?.username) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      const data = await getNotifications(user.username);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id, isRead) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isRead) {
        try {
          await markNotificationRead(id);
          // Update local state without reload
          setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spin" size={32} />
        <p>Opening your mailbox...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Inbox size={28} /> Internal Mailbox
          </h1>
          <p className="page-desc">All your booking confirmations and system alerts in one place</p>
        </div>
        <button className="btn btn--secondary" onClick={loadMessages}>Refresh</button>
      </div>

      <div className="mailbox-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <Mail size={48} className="text-muted" />
            <h3 className="mt-4">Your inbox is empty</h3>
            <p>New booking confirmations will appear here.</p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-card ${!msg.is_read ? 'unread' : ''} ${expandedId === msg.id ? 'expanded' : ''}`}
                onClick={() => toggleExpand(msg.id, msg.is_read)}
              >
                <div className="message-header">
                  <div className="message-icon">
                    {msg.is_read ? <MailOpen size={20} /> : <Mail size={20} className="text-accent" />}
                  </div>
                  <div className="message-info">
                    <span className="message-subject">{msg.subject}</span>
                    <span className="message-date">
                      <Clock size={12} /> {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="message-toggle">
                    {expandedId === msg.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {expandedId === msg.id && (
                  <div className="message-body">
                    <pre className="message-content">{msg.body}</pre>
                    <div className="message-footer">
                       <span className="status-badge"><CheckCircle size={14} /> System Verified</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
