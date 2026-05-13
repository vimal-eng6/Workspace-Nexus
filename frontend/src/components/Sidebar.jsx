import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isAdmin } from '../utils/rbac';
import { getUnreadCount } from '../api/services';
import { SOCKET_URL } from '../api/config';
import { io } from 'socket.io-client';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  Headset,
  LogOut,
  Building2,
  Sun,
  Moon,
  Palette,
  Check,
  ChevronDown,
  User,
  Inbox,
  Users,
  Megaphone,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, colorTheme, changeColorTheme, themes } = useTheme();
  const navigate = useNavigate();
  const [showPalette, setShowPalette] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChat, setUnreadChat] = useState(false);

  useEffect(() => {
    if (user?.username) {
      fetchUnread();
      
      const socket = io(SOCKET_URL);
      
      socket.on('new_notification', () => {
        fetchUnread();
      });

      socket.on('new_ticket_message', (data) => {
        // If message is from someone else, show dot
        if (data.sender_username !== user.username) {
          setUnreadChat(true);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const fetchUnread = async () => {
    try {
      const data = await getUnreadCount(user.username);
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/book', icon: <CalendarPlus size={20} />, label: 'Book Room' },
    { to: '/mailbox', icon: <Inbox size={20} />, label: 'Inbox', badge: unreadCount },
    { to: '/profile', icon: <User size={20} />, label: 'My Profile' },
    { to: '/my-bookings', icon: <CalendarDays size={20} />, label: 'My Bookings', hideForAdmin: true },
    { to: '/it-tickets', icon: <Headset size={20} />, label: 'IT Support', dot: unreadChat },
    { to: '/kt-library', icon: <Building2 size={20} />, label: 'KT Library' },
    { to: '/directory', icon: <Users size={20} />, label: 'Directory' },
    { to: '/announcements', icon: <Megaphone size={20} />, label: 'Announcements' },
  ];

  const visibleNavItems = navItems.filter(item => 
    !(item.hideForAdmin && isAdmin(user))
  );

  const themeColors = {
    indigo: '#6366f1',
    ocean: '#0ea5e9',
    emerald: '#10b981',
    rose: '#f43f5e',
    amber: '#f59e0b',
    violet: '#8b5cf6',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ padding: '25px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center' }}>
        <div 
          className="sidebar-logo-custom" 
          style={{ 
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b)',
            boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)',
            borderRadius: '14px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transform: 'rotate(-5deg)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(236, 72, 153, 0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(-5deg) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.3)'; }}
        >
          <Building2 size={26} strokeWidth={2.5} style={{ transform: 'none' }} />
        </div>
        <div className="sidebar-brand-text" style={{ marginLeft: '14px', flex: 1 }}>
          <span 
            className="brand-name" 
            style={{ 
              fontSize: '1.35rem', 
              fontWeight: '900', 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #1e293b, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'block',
              lineHeight: '1.2'
            }}
          >
            Office Sync
          </span>
          <span className="brand-tagline" style={{ fontWeight: '800', letterSpacing: '1.5px', color: '#f43f5e', fontSize: '0.65rem' }}>
            WORKSPACE
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
            onClick={() => {
              if (item.to === '/mailbox') setUnreadCount(0);
              if (item.to === '/it-tickets') setUnreadChat(false);
            }}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
            {item.badge > 0 && (
              <span className="sidebar-badge badge-pulse">{item.badge}</span>
            )}
            {item.dot && (
              <span className="sidebar-badge badge-pulse" style={{ width: '8px', height: '8px', minWidth: '8px', padding: 0 }}></span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Light/Dark Mode Toggle */}
        <div className="sidebar-theme-selection">
          <button 
            className={`theme-btn ${!isDarkMode ? 'active' : ''}`} 
            onClick={() => !isDarkMode ? null : toggleTheme()}
            title="Light Mode"
          >
            <Sun size={16} />
            <span>Light</span>
          </button>
          <button 
            className={`theme-btn ${isDarkMode ? 'active' : ''}`} 
            onClick={() => isDarkMode ? null : toggleTheme()}
            title="Dark Mode"
          >
            <Moon size={16} />
            <span>Dark</span>
          </button>
        </div>

        {/* Color Theme Picker */}
        <div className="theme-palette-wrapper">
          <button 
            className="theme-palette-trigger"
            onClick={() => setShowPalette(!showPalette)}
            id="theme-palette-trigger"
          >
            <Palette size={16} />
            <span className="theme-palette-trigger-label">
              <span className="theme-palette-current-name">{themes[colorTheme]?.name || 'Indigo'}</span>
              <span className="theme-palette-hint">Accent Color</span>
            </span>
            <ChevronDown size={14} className={`theme-palette-chevron ${showPalette ? 'open' : ''}`} />
          </button>

          {showPalette && (
            <div className="theme-palette-dropdown" id="theme-palette-dropdown">
              <div className="theme-palette-header">Choose Accent</div>
              <div className="theme-palette-grid">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    className={`theme-palette-option ${colorTheme === key ? 'active' : ''}`}
                    onClick={() => {
                      changeColorTheme(key);
                      setShowPalette(false);
                    }}
                    title={theme.name}
                    id={`theme-option-${key}`}
                  >
                    <span
                      className="theme-palette-swatch"
                      style={{ background: themeColors[key] }}
                    />
                    <span className="theme-palette-name">{theme.name}</span>
                    {colorTheme === key && (
                      <Check size={14} className="theme-palette-check" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-user-container">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user?.username}</span>
              <span className="sidebar-division">{user?.division || 'Team'}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
