import { API_BASE } from './config';

// ─── Auth ────────────────────────────────────────────
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
     const errorData = await res.json().catch(() => ({ message: 'Server error occurred' }));
     throw new Error(errorData.detail || errorData.message || 'Login failed');
  }

  const data = await res.json().catch(() => {
     throw new Error('Invalid server response format');
  });

  if (data.message && data.message.toLowerCase().includes('invalid')) {
    throw new Error(data.message);
  }

  return data;
}

export async function registerUser(username, email, password, division, role = 'user') {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, division, role }),
  });
  
  const data = await res.json().catch(() => ({ message: 'Could not parse response' }));
  
  if (!res.ok) {
    throw new Error(data.detail || data.message || 'Registration failed');
  }
  return data;
}

export async function getUserProfile(username) {
  const res = await fetch(`${API_BASE}/user/profile/${username}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfile(username, email, division) {
  const res = await fetch(`${API_BASE}/update-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, division }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update profile');
  return data;
}

export async function sendTestEmail(username, email) {
  const res = await fetch(`${API_BASE}/test-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Test email failed');
  return data;
}

// ─── Notifications ───────────────────────────────────
export async function getNotifications(username) {
  const res = await fetch(`${API_BASE}/notifications/${username}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE}/notifications/read/${id}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to update notification');
  return res.json();
}

export async function getUnreadCount(username) {
  const res = await fetch(`${API_BASE}/notifications/unread-count/${username}`);
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}

// ─── Rooms ───────────────────────────────────────────
export async function getRooms() {
  const res = await fetch(`${API_BASE}/rooms`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

// ─── Bookings ────────────────────────────────────────
export async function getBookings() {
  const res = await fetch(`${API_BASE}/all-bookings`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function getMyBookings(username) {
  const res = await fetch(`${API_BASE}/my-bookings/${username}`);
  if (!res.ok) throw new Error('Failed to fetch your bookings');
  return res.json();
}

export async function createBooking({ room_id, username, start_time, end_time, division, is_kt, kt_topic, kt_notes, cc_emails }) {
  const res = await fetch(`${API_BASE}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id, username, start_time, end_time, division, is_kt, kt_topic, kt_notes, cc_emails }),
  });
  
  const data = await res.json().catch(() => ({ message: 'Booking failed with invalid response' }));
  
  if (!res.ok) throw new Error(data.detail || data.message || 'Booking failed');
  return data;
}

export async function getKTLibrary(division) {
  const res = await fetch(`${API_BASE}/kt-library/${division}`);
  if (!res.ok) throw new Error('Failed to fetch KT library');
  return res.json();
}

export async function cancelBooking(bookingId) {
  const res = await fetch(`${API_BASE}/delete-booking/${bookingId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to cancel booking');
  return res.json();
}

// ─── IT Tickets ──────────────────────────────────────
export async function getITTickets() {
  const res = await fetch(`${API_BASE}/all-tickets`);
  if (!res.ok) throw new Error('Failed to fetch IT tickets');
  return res.json();
}

export async function getMyTickets(username) {
  const res = await fetch(`${API_BASE}/my-tickets/${username}`);
  if (!res.ok) throw new Error('Failed to fetch your tickets');
  return res.json();
}

export async function createITTicket({ booking_id, issue_type, description }) {
  const res = await fetch(`${API_BASE}/it-ticket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id, issue_type, description }),
  });
  
  const data = await res.json().catch(() => ({ message: 'Failed to create ticket' }));
  
  if (!res.ok) throw new Error(data.detail || data.message || 'Failed to create ticket');
  return data;
}

export async function updateTicketStatus(ticketId, status, username, adminComment = null) {
  const res = await fetch(`${API_BASE}/update-ticket/${ticketId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, username, admin_comment: adminComment }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to update ticket');
  }
  return res.json();
}

export async function getTicketMessages(ticketId) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendTicketMessage(ticketId, username, messageText) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender_username: username, message_text: messageText }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function updateTicketMessage(messageId, messageText) {
  const res = await fetch(`${API_BASE}/tickets/messages/${messageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message_text: messageText }),
  });
  if (!res.ok) throw new Error('Failed to update message');
  return res.json();
}

export async function deleteTicketMessage(messageId) {
  const res = await fetch(`${API_BASE}/tickets/messages/${messageId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete message');
  return res.json();
}

// ─── Directory ───────────────────────────────────────
export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

// ─── Announcements ───────────────────────────────────
export async function getAnnouncements() {
  const res = await fetch(`${API_BASE}/announcements`);
  if (!res.ok) throw new Error('Failed to fetch announcements');
  return res.json();
}

export async function createAnnouncement({ title, content, author }) {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, author }),
  });
  if (!res.ok) throw new Error('Failed to create announcement');
  return res.json();
}
