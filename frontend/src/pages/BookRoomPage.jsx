import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRooms, createBooking } from '../api/services';
import {
  CalendarPlus,
  DoorOpen,
  Clock,
  Users,
  Lightbulb,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function BookRoomPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isKT, setIsKT] = useState(false);
  const [ktTopic, setKtTopic] = useState('');
  const [ktNotes, setKtNotes] = useState('');
  const [ccEmails, setCcEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();

    // Helper to get current time in YYYY-MM-DDTHH:mm format
    const getNowFormatted = (date = new Date()) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Check for URL parameters to pre-fill the form
    const params = new URLSearchParams(location.search);
    const roomParam = params.get('room');
    const startParam = params.get('start');

    if (roomParam) setSelectedRoom(roomParam);
    
    if (startParam) {
      setStartTime(startParam);
      // Default end time to 1 hour after start
      const startDate = new Date(startParam);
      startDate.setHours(startDate.getHours() + 1);
      setEndTime(getNowFormatted(startDate));
    } else {
      // Default to exact current time if no param provided
      const now = new Date();
      setStartTime(getNowFormatted(now));
      
      const oneHourLater = new Date(now);
      oneHourLater.setHours(oneHourLater.getHours() + 1);
      setEndTime(getNowFormatted(oneHourLater));
    }
  }, [location]);


  const loadRooms = async () => {
    setLoadingRooms(true);
    setError('');
    try {
      const data = await getRooms();
      const parsedRooms = Array.isArray(data) ? data : data?.rooms || [];
      setRooms(parsedRooms);

      if (!parsedRooms.length) {
        console.warn('No rooms returned from API');
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setError('Could not connect to server to fetch rooms.');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedRoom) {
      setError('Please select a room before booking.');
      setLoading(false);
      return;
    }

    try {
      // Format times for the API
      const formattedStart = startTime.replace('T', ' ') + ':00';
      const formattedEnd = endTime.replace('T', ' ') + ':00';

      await createBooking({
        room_id: selectedRoom,
        username: user.username,
        start_time: formattedStart,
        end_time: formattedEnd,
        division: user.division,
        is_kt: isKT,
        kt_topic: isKT ? ktTopic : null,
        kt_notes: isKT ? ktNotes : null,
        cc_emails: ccEmails,
      });

      setSuccess('Room booked successfully! 🎉');
      // Reset form
      setSelectedRoom('');
      setStartTime('');
      setEndTime('');
      setIsKT(false);
      setKtTopic('');
      setKtNotes('');
      setCcEmails('');
    } catch (err) {
      setError(err.message || 'Booking failed. Time slot may be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarPlus size={28} /> Book a Room
          </h1>
          <p className="page-desc">Reserve a conference room for your team</p>
        </div>
      </div>

      <div className="book-layout">
        <div className="card book-form-card">
          <form onSubmit={handleSubmit} className="book-form">
            {error && <div className="alert alert--error">{error}</div>}
            {success && (
              <div className="alert alert--success">
                <CheckCircle2 size={18} /> {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="book-room" className="form-label">
                <DoorOpen size={16} /> Select Room
              </label>
              {loadingRooms ? (
                <div className="form-loading"><Loader2 size={18} className="spin" /> Loading rooms...</div>
              ) : (
                <div className="room-visual-grid">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`room-visual-card ${String(selectedRoom) === String(room.id) ? 'active' : ''}`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="room-visual-header">
                        <span className="room-visual-name">{room.name || `Room ${room.id}`}</span>
                        <span className="room-visual-location">{room.location || 'Hub'}</span>
                      </div>

                      <div className="detail-item" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Users size={14} /> <span>Capacity {room.capacity || 0}</span>
                      </div>

                      <div className="room-visual-amenities">
                        {(room.amenities || 'WiFi, Projector').split(',').map((tag, idx) => (
                          <span key={idx} className="amenity-tag">{tag.trim()}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="book-start" className="form-label">
                  <Clock size={16} /> Start Time
                </label>
                <input
                  id="book-start"
                  type="datetime-local"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="book-end" className="form-label">
                  <Clock size={16} /> End Time
                </label>
                <input
                  id="book-end"
                  type="datetime-local"
                  className="form-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cc-emails" className="form-label">
                <Send size={16} /> Notify Others (Team Leader, Members, Manager)
              </label>
              <input
                id="cc-emails"
                type="text"
                className="form-input"
                placeholder="Comma-separated emails (e.g., manager@company.com, team@company.com)"
                value={ccEmails}
                onChange={(e) => setCcEmails(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isKT}
                  onChange={(e) => setIsKT(e.target.checked)}
                />
                <Lightbulb size={16} />
                <span>This is a Knowledge Transfer (KT) session</span>
              </label>
            </div>

            {isKT && (
              <div className="kt-fields">
                <div className="form-group">
                  <label htmlFor="kt-topic" className="form-label">KT Topic</label>
                  <input
                    id="kt-topic"
                    type="text"
                    className="form-input"
                    placeholder="e.g., React Hooks Deep Dive"
                    value={ktTopic}
                    onChange={(e) => setKtTopic(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="kt-notes" className="form-label">Session Notes</label>
                  <textarea
                    id="kt-notes"
                    className="form-input form-textarea"
                    placeholder="Add any agenda or notes..."
                    rows={3}
                    value={ktNotes}
                    onChange={(e) => setKtNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loader"></span>
              ) : (
                <>
                  <Send size={18} /> Confirm Booking
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar info */}
        <div className="book-info-cards">
          <div className="card info-card">
            <h3 className="info-card-title">
              <Users size={18} /> Your Details
            </h3>
            <div className="info-item">
              <span className="info-key">User</span>
              <span className="info-val">{user?.username}</span>
            </div>
            <div className="info-item">
              <span className="info-key">Division</span>
              <span className="info-val">{user?.division || 'General'}</span>
            </div>
          </div>

          {selectedRoom && rooms.find(r => String(r.id) === String(selectedRoom)) && (
            <div className="card info-card">
              <h3 className="info-card-title">
                <DoorOpen size={18} /> Room Features
              </h3>
              <div className="info-item">
                <span className="info-key">Capacity</span>
                <span className="info-val">{rooms.find(r => String(r.id) === String(selectedRoom)).capacity} Persons</span>
              </div>
              <div className="info-item">
                <span className="info-key">Amenities</span>
                <span className="info-val" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                  {rooms.find(r => String(r.id) === String(selectedRoom)).amenities || 'WiFi, Projector'}
                </span>
              </div>
            </div>
          )}

          <div className="card info-card">
            <h3 className="info-card-title">
              <Lightbulb size={18} /> Booking Tips
            </h3>
            <ul className="info-list">
              <li>Rooms are first-come, first-served</li>
              <li>Collision detection prevents double-bookings</li>
              <li>KT sessions are private to your division</li>
              <li>Need IT help? Create a ticket after booking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
