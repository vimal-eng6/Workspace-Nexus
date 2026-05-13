import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRooms, getBookings } from '../api/services';
import { SOCKET_URL } from '../api/config';
import { io } from 'socket.io-client';
import Modal from '../components/Modal';
import {
  CalendarDays,
  Clock,
  Users,
  DoorOpen,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  CalendarCheck,
  Lightbulb,
  Download,
  Zap,
  BarChart3,
} from 'lucide-react';


const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM - 7 PM

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [locationFilter, setLocationFilter] = useState('All');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    loadData();

    // Setup Socket.io for Real-Time Updates
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => {
      console.log('Connected to realtime socket');
    });
    
    socket.on('refresh_bookings', () => {
      console.log('Refresh trigger received via socket');
      loadData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const [roomsData, bookingsData] = await Promise.all([
        getRooms(),
        getBookings(),
      ]);
      
      const parsedRooms = Array.isArray(roomsData) ? roomsData : roomsData?.rooms || [];
      const parsedBookings = Array.isArray(bookingsData) ? bookingsData : bookingsData?.bookings || [];
      
      setRooms(parsedRooms);
      setAllBookings(parsedBookings);
      
    } catch (err) {
      console.error('Failed to load data:', err);
      setErrorStatus(err.message || 'Connection error with server');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (room, hour, slot) => {
    if (!slot.booked) {
      // Navigate to booking page with pre-filled room and time
      const date = selectedDate;
      const start = `${date}T${String(hour).padStart(2, '0')}:00`;
      navigate(`/book?room=${room.id}&start=${start}`);
      return;
    }

    if (slot.isPrivate) {
      alert("This Knowledge Transfer session is private to the " + (slot.division || "originating") + " division.");
      return;
    }

    setDetailModal(slot.booking);
  };

  // Client-side date filtering since backend returns all bookings
  const bookings = allBookings.filter((b) => {
    const bookingDate = b.start_time?.split('T')[0] || b.start_time?.split(' ')[0];
    return bookingDate === selectedDate;
  });


  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const locations = ['All', ...new Set(rooms.map((r) => r.location || 'Office'))];
  const divisions = ['All', 'Software', 'SDS', 'Tekla'];

  const filteredRooms = rooms.filter((r) => {
    return locationFilter === 'All' || (r.location || 'Office') === locationFilter;
  });

  const filteredActivity = allBookings.filter((b) => {
    return divisionFilter === 'All' || b.division?.toLowerCase() === divisionFilter.toLowerCase();
  });

  const getBookingsForRoom = (roomId) =>
    bookings.filter((b) => b.room_id === roomId || b.room_id === String(roomId));

  const getSlotStatus = (roomId, hour) => {
    const roomBookings = getBookingsForRoom(roomId);
    
    // Parse selectedDate parts to create local date boundaries
    const [y, m, d] = selectedDate.split('-').map(Number);
    const slotStart = new Date(y, m - 1, d, hour, 0, 0);
    const slotEnd = new Date(y, m - 1, d, hour + 1, 0, 0);

    for (const b of roomBookings) {
      if (!b.start_time || !b.end_time) continue;
      
      // Handle both "YYYY-MM-DD HH:mm:ss" and ISO formats safely
      const startStr = b.start_time.includes('T') ? b.start_time : b.start_time.replace(' ', 'T');
      const endStr = b.end_time.includes('T') ? b.end_time : b.end_time.replace(' ', 'T');
      
      // Create local Date objects (browsers treat T strings without Z as local in modern JS)
      const start = new Date(startStr);
      const end = new Date(endStr);

      if (slotStart < end && slotEnd > start) {
        // Privacy: if the booking has a division field and it doesn't match the user's division
        const bookingDivision = b.division || null;
        const isOwnDivision = !bookingDivision || !user?.division || bookingDivision.toLowerCase() === user.division.toLowerCase();
        
        const label = b.role === 'admin' ? 'Reserved by Admin' : (b.username || 'Booked');
        const startStr = new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const endStr = new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        return {
          booked: true,
          booking: b,
          label: `${label} (${startStr} - ${endStr})`,
          isPrivate: !!b.is_kt && !isOwnDivision,
          isKT: !!b.is_kt,
          division: bookingDivision,
        };
      }
    }
    return { booked: false };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Stats
  const totalRooms = filteredRooms.length;
  const totalBookingsToday = bookings.length;
  const bookedRoomIds = new Set(bookings.map((b) => b.room_id));
  const availableRooms = totalRooms - bookedRoomIds.size;

  // Analytics: Top Rooms
  const roomBookingCounts = {};
  filteredRooms.forEach(r => roomBookingCounts[r.id] = 0);
  allBookings.forEach(b => {
    if (roomBookingCounts[b.room_id] !== undefined) {
      roomBookingCounts[b.room_id]++;
    }
  });
  const maxVolume = Math.max(...Object.values(roomBookingCounts), 1);
  const topRooms = Object.keys(roomBookingCounts)
    .map(roomId => {
      const room = rooms.find(r => String(r.id) === String(roomId));
      return {
        id: roomId,
        name: room ? room.name : `Room ${roomId}`,
        count: roomBookingCounts[roomId]
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Advanced Feature: Magic Quick Book (Find me a room now)
  const handleQuickBook = () => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 8 || currentHour >= 19) {
       alert("Office is currently closed for bookings (Hours: 8 AM - 7 PM).");
       return;
    }
    // Find first room with current slot empty
    const availableRoom = filteredRooms.find(r => {
      const slot = getSlotStatus(r.id, currentHour);
      return !slot.booked;
    });

    if (availableRoom) {
      const date = selectedDate;
      const start = `${date}T${String(currentHour).padStart(2, '0')}:00`;
      navigate(`/book?room=${availableRoom.id}&start=${start}`);
    } else {
      alert("No rooms are currently available for this hour! Try another time.");
    }
  };

  // Advanced Feature: Export to CSV (Reporting)
  const downloadCSV = () => {
    const headers = ["Booking ID", "Room", "User", "Division", "Start Time", "End Time", "Type"];
    const csvRows = [headers.join(',')];

    allBookings.forEach(b => {
      const room = rooms.find(r => String(r.id) === String(b.room_id))?.name || `Room ${b.room_id}`;
      const type = b.is_kt ? 'KT Session' : 'Standard Meeting';
      csvRows.push(`${b.id},"${room}","${b.username}","${b.division}","${b.start_time}","${b.end_time}","${type}"`);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `office-sync-report-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">
            Welcome back, <strong>{user?.username}</strong> — {user?.division || 'Team'} Division
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button className="btn btn--secondary" onClick={downloadCSV} title="Export Booking Data">
             <Download size={16} /> Export Data
           </button>
           <button className="btn btn--primary" onClick={handleQuickBook} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--amber)' }}>
             <Zap size={16} /> Quick Book Now
           </button>
           <button className="btn btn--secondary" onClick={loadData}>
             Refresh
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-icon"><DoorOpen size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{totalRooms}</span>
            <span className="stat-label">Total Rooms</span>
          </div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-icon"><CalendarDays size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{totalBookingsToday}</span>
            <span className="stat-label">Bookings Today</span>
          </div>
        </div>
        <div className="stat-card stat-card--purple">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{availableRooms}</span>
            <span className="stat-label">Available Now</span>
          </div>
        </div>
        <div className="stat-card stat-card--amber">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{user?.division || '—'}</span>
            <span className="stat-label">Your Division</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        <div className="dashboard-main-content">
          {/* Filters */}
          <div className="dashboard-controls">
            <div className="date-nav">
              <button className="btn btn--icon" onClick={() => changeDate(-1)}>
                <ChevronLeft size={20} />
              </button>
              <div className="date-display">
                <CalendarDays size={18} />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <button className="btn btn--icon" onClick={() => changeDate(1)}>
                <ChevronRight size={20} />
              </button>
              <input
                type="date"
                className="form-input date-picker-inline"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="location-filter">
              <MapPin size={16} />
              <select
                className="form-input form-select form-select--sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="location-filter">
              <Users size={16} />
              <select
                className="form-input form-select form-select--sm"
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
              >
                <option value="All">All Divisions</option>
                {divisions.filter(d => d !== 'All').map((div) => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>
          </div>

      {errorStatus && (
        <div className="alert alert--error mb-4">
          <Info size={18} />
          <strong>Server Error: </strong> {errorStatus}. Make sure the backend is running.
        </div>
      )}

      {/* Schedule Grid */}
      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading schedule...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="empty-state">
          <DoorOpen size={48} />
          <h3>No rooms found</h3>
          <p>There are no rooms available for the selected filter.</p>
        </div>
      ) : (
        <div className="schedule-wrapper">
          <div className="schedule-grid">
            {/* Header row */}
            <div className="schedule-cell schedule-corner">Room</div>
            {HOURS.map((h) => (
              <div key={h} className="schedule-cell schedule-hour-header">
                {h > 12 ? h - 12 : h}{h >= 12 ? 'PM' : 'AM'}
              </div>
            ))}

            {/* Room rows */}
            {filteredRooms.map((room) => (
              <div key={room.id} className="schedule-row-fragment" style={{ display: 'contents' }}>
                <div className="schedule-cell schedule-room-label">
                  <span className="room-name">{room.name || `Room ${room.id}`}</span>
                  <div className="room-meta">
                    {room.capacity && (
                      <span className="room-capacity">
                        <Users size={12} /> {room.capacity}
                      </span>
                    )}
                  </div>
                  {room.amenities && (
                    <div className="room-amenities-container">
                      {room.amenities.split(',').map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">
                          {amenity.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {HOURS.map((h) => {
                  const slot = getSlotStatus(room.id, h);
                  return (
                    <div
                      key={`${room.id}-${h}`}
                      className={`schedule-cell schedule-slot ${
                        slot.booked
                          ? slot.isPrivate
                            ? 'schedule-slot--private'
                            : slot.isKT
                            ? 'schedule-slot--kt'
                            : 'schedule-slot--booked'
                          : 'schedule-slot--free'
                      }`}
                      onClick={() => handleSlotClick(room, h, slot)}
                      style={{ cursor: 'pointer' }}
                    >
                      {slot.booked && (
                        <span className="slot-label">
                          {slot.label}
                        </span>
                      )}
                    </div>

                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="schedule-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot--free"></span> Available
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--booked"></span> Booked
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--private"></span> Private / Occupied
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--kt"></span> KT Session
            </div>
          </div>
        </div>
      )}
    </div>

        {/* Recent Activity Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="card activity-card">
            <h3 className="activity-title">
              <Clock size={18} /> Recent Activity
            </h3>
            <div className="activity-list">
              {filteredActivity.slice(0, 8).map((b, idx) => (
                <div key={b.id} className="activity-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="activity-icon-wrapper">
                    <div className={`activity-icon-bg ${b.is_kt ? 'kt' : 'booked'}`}>
                      {b.is_kt ? <Lightbulb size={14} /> : <CalendarCheck size={14} />}
                    </div>
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-user">{b.username}</span>
                      <div className="activity-time">
                      {new Date(b.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    </div>
                    <p className="activity-text">
                      Reserved <span className="room-highlight">{rooms.find(r => String(r.id) === String(b.room_id))?.name || 'Room'}</span>
                    </p>
                  </div>
                </div>
              ))}
              {allBookings.length === 0 && <p className="empty-msg">No recent activity</p>}
            </div>
          </div>

          <div className="card info-card mt-4">
             <h3 className="activity-title" style={{ color: 'var(--amber)' }}>
                <Info size={18} /> System Tips
             </h3>
             <ul className="info-list" style={{ marginTop: '0.5rem' }}>
                <li style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Check for KT badges in the schedule</li>
                <li style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Toggle light/dark for late night work</li>
             </ul>
          </div>
          
          <div className="card info-card mt-4">
             <h3 className="activity-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <BarChart3 size={18} color="var(--indigo)" /> Top Reserved Rooms
             </h3>
             <div className="analytics-bars" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topRooms.map(tr => {
                   const percentage = (tr.count / maxVolume) * 100;
                   return (
                     <div key={tr.id} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span>{tr.name}</span>
                          <span style={{ fontWeight: 'bold' }}>{tr.count} bookings</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                           <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--indigo)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                        </div>
                     </div>
                   )
                })}
             </div>
          </div>
        </aside>
      </div>
      
      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Booking Details"
      >
        {detailModal && (
          <div className="booking-detail">
             <div className="detail-header">
                <CalendarCheck className="detail-icon" />
                <div className="detail-room-name">
                   {rooms.find(r => r.id === detailModal.room_id || String(r.id) === String(detailModal.room_id))?.name || `Room ${detailModal.room_id}`}
                </div>
             </div>
             
             <div className="detail-grid">
                <div className="detail-item">
                   <Clock size={16} />
                   <span>{new Date(detailModal.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(detailModal.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="detail-item">
                   <Users size={16} />
                   <span>{detailModal.username} ({detailModal.division})</span>
                </div>
                {detailModal.is_kt ? (
                   <div className="detail-kt-badge">
                      <Lightbulb size={14} />
                      Knowledge Transfer
                   </div>
                ) : null}
             </div>
             
             {!!detailModal.is_kt && detailModal.kt_topic && (
                <div className="detail-kt-info">
                   <div className="detail-label">KT Topic</div>
                   <div className="detail-val">{detailModal.kt_topic}</div>
                </div>
             )}
             
             {!!detailModal.is_kt && detailModal.kt_notes && (
                <div className="detail-kt-info">
                   <div className="detail-label">Notes</div>
                   <div className="detail-val">{detailModal.kt_notes}</div>
                </div>
             )}
             
             <button className="btn btn--primary btn--full mt-4" onClick={() => setDetailModal(null)}>
                Close
             </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

