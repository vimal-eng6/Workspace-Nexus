import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking, createITTicket } from '../api/services';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import {
  CalendarDays,
  Clock,
  DoorOpen,
  Trash2,
  Headset,
  Loader2,
  CalendarX,
  AlertTriangle,
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState(null);
  const [issueType, setIssueType] = useState('Projector');
  const [issueDesc, setIssueDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings(user.username);
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createITTicket({
        booking_id: ticketModal.id,
        issue_type: issueType,
        description: issueDesc,
      });
      alert('IT Ticket created successfully!');
      setTicketModal(null);
      setIssueType('Projector');
      setIssueDesc('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isFuture = (dt) => new Date(dt) > new Date();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarDays size={28} /> My Bookings
          </h1>
          <p className="page-desc">View and manage your room reservations</p>
        </div>
        <button className="btn btn--secondary" onClick={loadBookings}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <CalendarX size={48} />
          <h3>No bookings yet</h3>
          <p>You haven't booked any rooms. Head to "Book Room" to get started!</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((b) => (
            <div key={b.id} className={`card booking-card ${b.is_kt ? 'booking-card--kt' : ''}`}>
              <div className="booking-card-header">
                <div className="booking-room">
                  <DoorOpen size={18} />
                  <span>{b.room_name || `Room ${b.room_id}`}</span>
                </div>
                <div className="booking-badges">
                  {b.is_kt && <StatusBadge status="KT" variant="info" />}
                  <StatusBadge
                    status={isFuture(b.start_time) ? 'Upcoming' : 'Past'}
                    variant={isFuture(b.start_time) ? 'success' : 'muted'}
                  />
                </div>
              </div>

              <div className="booking-card-body">
                <div className="booking-time">
                  <Clock size={15} />
                  <span>{formatDateTime(b.start_time)} — {formatDateTime(b.end_time)}</span>
                </div>
                {b.is_kt && b.kt_topic && (
                  <div className="booking-kt-topic">
                    <strong>KT Topic:</strong> {b.kt_topic}
                  </div>
                )}
              </div>

              <div className="booking-card-actions">
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => setTicketModal(b)}
                  title="Request IT Support"
                >
                  <Headset size={16} /> IT Help
                </button>
                {isFuture(b.start_time) && (
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => handleCancel(b.id)}
                    title="Cancel Booking"
                  >
                    <Trash2 size={16} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IT Ticket Modal */}
      <Modal
        isOpen={!!ticketModal}
        onClose={() => setTicketModal(null)}
        title="Request IT Support"
      >
        <form onSubmit={handleCreateTicket} className="modal-form">
          <div className="modal-booking-info">
            <AlertTriangle size={16} />
            <span>
              Ticket for <strong>{ticketModal?.room_name || `Room ${ticketModal?.room_id}`}</strong>{' '}
              on {formatDateTime(ticketModal?.start_time)}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-type" className="form-label">Issue Type</label>
            <select
              id="ticket-type"
              className="form-input form-select"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option value="Projector">Projector / Display</option>
              <option value="Network">Network / Wi-Fi</option>
              <option value="Audio">Audio / Microphone</option>
              <option value="Power">Power / Outlets</option>
              <option value="Software">Software Setup</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ticket-desc" className="form-label">Description</label>
            <textarea
              id="ticket-desc"
              className="form-input form-textarea"
              placeholder="Describe the issue or setup needed..."
              rows={3}
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={submitting}
          >
            {submitting ? <span className="btn-loader"></span> : 'Submit IT Ticket'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
