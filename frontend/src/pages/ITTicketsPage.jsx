import { useState, useEffect } from 'react';
import { 
  getITTickets, 
  updateTicketStatus, 
  getTicketMessages, 
  sendTicketMessage,
  updateTicketMessage,
  deleteTicketMessage 
} from '../api/services';
import { SOCKET_URL } from '../api/config';
import { io } from 'socket.io-client';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/rbac';
import {
  Headset,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Inbox,
  Lock,
  Edit3,
  MessageSquare,
  AlertTriangle,
  XCircle,
  Trash2,
  Pencil,
  Check,
  X
} from 'lucide-react';

export default function ITTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editComment, setEditComment] = useState('');
  
  // Chat States
  const [chatTicket, setChatTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null); // {id, text}
  
  const { user } = useAuth();
  const adminPrivileges = isAdmin(user);

  useEffect(() => {
    loadTickets();

    const socket = io(SOCKET_URL);
    socket.on('new_ticket_message', (data) => {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    socket.on('message_updated', (data) => {
      setMessages(prev => prev.map(m => m.id === data.id ? { ...m, message_text: data.message_text } : m));
    });

    socket.on('message_deleted', (data) => {
      setMessages(prev => prev.filter(m => m.id !== data.id));
    });

    return () => socket.disconnect();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getITTickets();
      const allTickets = Array.isArray(data) ? data : data.tickets || [];
      
      // Filter logic: Admins see everything, Users see only their own
      if (adminPrivileges) {
        setTickets(allTickets);
      } else {
        setTickets(allTickets.filter(t => t.booked_by === user?.username));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (ticket) => {
    setEditModal(ticket);
    setEditStatus(ticket.status || 'Open');
    setEditComment(ticket.admin_comment || '');
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!adminPrivileges) return;

    setUpdatingId(editModal.id);
    try {
      await updateTicketStatus(editModal.id, editStatus, user.username, editComment);
      setTickets((prev) =>
        prev.map((t) => (t.id === editModal.id ? { ...t, status: editStatus, admin_comment: editComment } : t))
      );
      setEditModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };
  const openChat = async (ticket) => {
    setChatTicket(ticket);
    try {
      const data = await getTicketMessages(ticket.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendTicketMessage(chatTicket.id, user.username, newMessage);
      setNewMessage('');
      // Note: The message will be added via the socket listener for real-time feel
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteTicketMessage(messageId);
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const handleEditMessage = async (e) => {
    if (e) e.preventDefault();
    if (!editingMessage.text.trim()) return;

    try {
      await updateTicketMessage(editingMessage.id, editingMessage.text);
      setEditingMessage(null);
    } catch (err) {
      alert('Failed to update message');
    }
  };

  const filtered =
    filter === 'All' ? tickets : tickets.filter((t) => t.status === filter);

  const stats = {
    All: tickets.length,
    Open: tickets.filter((t) => t.status === 'Open').length,
    'In Progress': tickets.filter((t) => t.status === 'In Progress').length,
    Resolved: tickets.filter((t) => t.status === 'Resolved').length,
    Unresolvable: tickets.filter((t) => t.status === 'Unresolvable').length,
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Open': return 'warning';
      case 'In Progress': return 'info';
      case 'Resolved': return 'success';
      case 'Unresolvable': return 'danger';
      default: return 'muted';
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Headset size={28} /> IT Support Tickets
          </h1>
          <p className="page-desc">Track and manage room setup requests</p>
        </div>
        <button className="btn btn--secondary" onClick={loadTickets}>
          Refresh
        </button>
      </div>

      {/* Ticket Stats */}
      <div className="ticket-stats" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
        {Object.entries(stats).map(([label, count]) => (
          <button
            key={label}
            className={`ticket-stat-btn ${filter === label ? 'ticket-stat-btn--active' : ''}`}
            onClick={() => setFilter(label)}
          >
            <span>{label}</span>
            <span className="ticket-stat-count">{count}</span>
          </button>
        ))}
      </div>

      {adminPrivileges ? (
        <div className="alert alert--success" style={{ marginBottom: '1.5rem' }}>
          <Headset size={16} />
          <span><strong>IT Admin Mode:</strong> You can manage and resolve all support requests.</span>
        </div>
      ) : (
        <div className="alert alert--info" style={{ marginBottom: '1.5rem' }}>
          <Lock size={16} />
          <span><strong>My Requests:</strong> Tracking tickets raised for your bookings. Only IT Admins can resolve them.</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} />
          <h3>No tickets found</h3>
          <p>{filter === 'All' ? 'No IT support tickets have been created yet.' : `No ${filter.toLowerCase()} tickets.`}</p>
        </div>
      ) : (
        <div className="tickets-table-wrapper">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Booking</th>
                <th>Issue Type</th>
                <th>Description</th>
                <th>Status</th>
                {adminPrivileges && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id} className={`ticket-row ticket-row--${ticket.status?.toLowerCase().replace(' ', '-')}`}>
                  <td className="ticket-id">#{ticket.id}</td>
                  <td>
                    <div className="ticket-booking">
                      <div className="ticket-room-info">
                        <strong>{ticket.room_name}</strong>
                      </div>
                      <div className="ticket-time-info">
                         {new Date(ticket.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ticket-issue-type">{ticket.issue_type}</span>
                    <div className="ticket-user-info">By: {ticket.booked_by}</div>
                  </td>

                  <td className="ticket-desc-cell">
                    <div className="ticket-desc-text">{ticket.description || '—'}</div>
                    {ticket.admin_comment && (
                      <div className="ticket-admin-msg">
                        <MessageSquare size={12} />
                        <span>{ticket.admin_comment}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusBadge
                      status={ticket.status}
                      variant={getStatusVariant(ticket.status)}
                    />
                  </td>
                    <td className="ticket-actions">
                      <div className="btn-group-horizontal">
                        <button
                          className="btn btn--sm btn--secondary"
                          onClick={() => openChat(ticket)}
                          title="Chat with IT"
                        >
                          <MessageSquare size={14} /> Chat
                        </button>
                        {adminPrivileges && (
                          <button
                            className="btn btn--sm btn--ghost"
                            onClick={() => openEditModal(ticket)}
                            title="Edit Ticket"
                          >
                            <Edit3 size={14} /> Manage
                          </button>
                        )}
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* IT Support Chat Modal */}
      <Modal
        isOpen={!!chatTicket}
        onClose={() => setChatTicket(null)}
        title={`Chat with IT Support (#${chatTicket?.id})`}
      >
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No messages yet. Ask IT a question below!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                  <div className="chat-message-wrapper">
                    <div className={`chat-message ${msg.sender_username === user.username ? 'chat-message--user' : 'chat-message--other'}`}>
                      <span className="chat-meta">
                        <strong>{msg.sender_username}</strong> • {msg.created_at !== 'Just now' ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                      
                      {editingMessage?.id === msg.id ? (
                        <div className="edit-message-box">
                          <input 
                            className="form-input chat-input edit-input" 
                            value={editingMessage.text}
                            onChange={(e) => setEditingMessage({...editingMessage, text: e.target.value})}
                            autoFocus
                          />
                          <div className="edit-actions">
                             <button className="edit-btn confirm" onClick={handleEditMessage}><Check size={14}/></button>
                             <button className="edit-btn cancel" onClick={() => setEditingMessage(null)}><X size={14}/></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="chat-text">{msg.message_text}</div>
                          {msg.sender_username === user.username && (
                            <div className="message-actions">
                              <button className="msg-action-btn" onClick={() => setEditingMessage({id: msg.id, text: msg.message_text})}><Pencil size={12}/></button>
                              <button className="msg-action-btn delete" onClick={() => handleDeleteMessage(msg.id)}><Trash2 size={12}/></button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input
              type="text"
              className="form-input chat-input"
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              autoFocus
            />
            <button 
              type="submit" 
              className="btn btn--primary chat-send-btn"
              disabled={!newMessage.trim() || sendingMessage}
            >
              {sendingMessage ? <Loader2 size={16} className="spin" /> : <MessageSquare size={16} />}
            </button>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={`Manage Ticket #${editModal?.id}`}
      >
        <form onSubmit={handleUpdateTicket} className="modal-form">
          <div className="modal-ticket-summary">
             <div className="summary-item">
                <strong>Issue:</strong> {editModal?.issue_type}
             </div>
             <div className="summary-item">
                <strong>By:</strong> {editModal?.booked_by}
             </div>
          </div>

          <div className="form-group">
            <label className="form-label">Set Status</label>
            <div className="status-options-grid">
              {[
                { val: 'Open', icon: <AlertCircle size={14} />, label: 'Open' },
                { val: 'In Progress', icon: <Clock size={14} />, label: 'Working' },
                { val: 'Resolved', icon: <CheckCircle2 size={14} />, label: 'Resolved' },
                { val: 'Unresolvable', icon: <XCircle size={14} />, label: 'Can\'t Fix' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`status-opt-btn ${editStatus === opt.val ? 'active' : ''} status-opt--${opt.val.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setEditStatus(opt.val)}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-comment" className="form-label">
              <MessageSquare size={16} /> Admin Message / Response
            </label>
            <textarea
              id="admin-comment"
              className="form-input form-textarea"
              placeholder="Provide an update or message to the user..."
              rows={4}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={updatingId === editModal?.id}
          >
            {updatingId === editModal?.id ? <Loader2 size={18} className="spin" /> : 'Save Changes'}
          </button>
        </form>
      </Modal>

      <style>{`
        .ticket-actions {
          white-space: nowrap;
        }
        .btn-group-horizontal {
          display: flex;
          gap: 6px;
        }
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 400px;
          background: var(--bg-secondary);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chat-message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 0.9rem;
          position: relative;
        }
        .chat-message-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .message-actions {
          display: flex;
          gap: 8px;
          margin-top: 6px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .chat-message:hover .message-actions {
          opacity: 1;
        }
        .msg-action-btn {
          background: none;
          border: none;
          padding: 2px;
          color: inherit;
          opacity: 0.6;
          cursor: pointer;
        }
        .msg-action-btn:hover {
          opacity: 1;
        }
        .msg-action-btn.delete:hover {
          color: #ff4d4d;
        }
        .edit-message-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .edit-input {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        .chat-message--other .edit-input {
           color: var(--text-primary) !important;
           background: var(--bg-secondary) !important;
           border-color: var(--border) !important;
        }
        .edit-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }
        .edit-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .edit-btn.confirm { background: #10b981; color: white; }
        .edit-btn.cancel { background: #6b7280; color: white; }

        .chat-message--user {
          align-self: flex-end;
          background: var(--accent);
          color: white;
          border-bottom-right-radius: 2px;
        }
        .chat-message--other {
          align-self: flex-start;
          background: var(--card-bg);
          border: 1px solid var(--border);
          color: var(--text-primary);
          border-bottom-left-radius: 2px;
        }
        .chat-meta {
          font-size: 0.7rem;
          margin-bottom: 4px;
          opacity: 0.8;
          display: block;
        }
        .chat-input-area {
          padding: 12px;
          background: var(--card-bg);
          border-top: 1px solid var(--border);
          display: flex;
          gap: 8px;
        }
        .chat-input {
          flex: 1;
          border-radius: 20px !important;
          padding-left: 16px !important;
        }
        .chat-send-btn {
          border-radius: 50% !important;
          width: 38px;
          height: 38px;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ticket-admin-msg {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(var(--indigo-rgb), 0.05);
          border-left: 3px solid var(--indigo);
          border-radius: 4px;
          font-size: 0.8rem;
          color: var(--text-primary);
        }
        .status-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 5px;
        }
        .status-opt-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--card-bg);
          color: var(--text-secondary);
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        .status-opt-btn:hover {
          border-color: var(--indigo);
          color: var(--indigo);
        }
        .status-opt-btn.active {
          border-color: var(--indigo);
          background: rgba(var(--indigo-rgb), 0.08);
          color: var(--indigo);
          font-weight: 600;
        }
        .modal-ticket-summary {
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        .summary-item {
          margin-bottom: 4px;
        }
        .ticket-row--in-progress { background: rgba(var(--ocean-rgb), 0.02); }
        .ticket-row--resolved { background: rgba(var(--emerald-rgb), 0.02); opacity: 0.8; }
        .ticket-row--unresolvable { background: rgba(var(--rose-rgb), 0.02); }
      `}</style>
    </div>
  );
}
