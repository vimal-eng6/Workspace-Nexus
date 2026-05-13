import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookRoomPage from './pages/BookRoomPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ITTicketsPage from './pages/ITTicketsPage';
import KTLibraryPage from './pages/KTLibraryPage';
import ProfilePage from './pages/ProfilePage';
import MailboxPage from './pages/MailboxPage';
import DirectoryPage from './pages/DirectoryPage';
import AnnouncementsPage from './pages/AnnouncementsPage';


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/book" element={<BookRoomPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/it-tickets" element={<ITTicketsPage />} />
              <Route path="/kt-library" element={<KTLibraryPage />} />
              <Route path="/mailbox" element={<MailboxPage />} />
              <Route path="/directory" element={<DirectoryPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
            </Route>


            {/* Redirect root */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}