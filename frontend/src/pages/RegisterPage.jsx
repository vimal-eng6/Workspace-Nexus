import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/services';
import { useTheme } from '../context/ThemeContext';
import { Building2, Eye, EyeOff, Sun, Moon, Palette, Check, ChevronDown } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [division, setDivision] = useState('Software');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const { isDarkMode, toggleTheme, colorTheme, changeColorTheme, themes } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerUser(username, email, password, division, role);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-shape auth-bg-shape--1"></div>
        <div className="auth-bg-shape auth-bg-shape--2"></div>
        <div className="auth-bg-shape auth-bg-shape--3"></div>
      </div>
      
      {/* Theme Controls Moved to Page Corner */}
      <div className="auth-theme-controls">
        <div className="theme-palette-wrapper">
          <button 
            type="button"
            className="theme-palette-trigger"
            onClick={() => setShowPalette(!showPalette)}
          >
            <Palette size={16} />
            <span className="theme-palette-trigger-label">
              <span className="theme-palette-current-name">{themes[colorTheme]?.name || 'Indigo'}</span>
            </span>
            <ChevronDown size={14} className={`theme-palette-chevron ${showPalette ? 'open' : ''}`} />
          </button>

          {showPalette && (
            <div className="theme-palette-dropdown">
              <div className="theme-palette-header">Choose Accent</div>
              <div className="theme-palette-grid">
                {Object.entries(themes).map(([key, theme]) => {
                  const themeColors = {
                    indigo: '#6366f1', ocean: '#0ea5e9', emerald: '#10b981', 
                    rose: '#f43f5e', amber: '#f59e0b', violet: '#8b5cf6'
                  };
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`theme-palette-option ${colorTheme === key ? 'active' : ''}`}
                      onClick={() => {
                        changeColorTheme(key);
                        setShowPalette(false);
                      }}
                    >
                      <span
                        className="theme-palette-swatch"
                        style={{ background: themeColors[key] }}
                      />
                      <span className="theme-palette-name">{theme.name}</span>
                      {colorTheme === key && <Check size={14} className="theme-palette-check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button 
          type="button"
          className="theme-toggle" 
          style={{ position: 'static' }}
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Building2 size={32} />
          </div>
          <h1 className="auth-title">Office Sync</h1>
          <p className="auth-subtitle">Room & IT Operations Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-desc">Join your team on Office Sync</p>

          {error && <div className="alert alert--error">{error}</div>}
          {success && <div className="alert alert--success">{success}</div>}

          <div className="form-group">
            <label htmlFor="reg-username" className="form-label">Username</label>
            <input
              id="reg-username"
              className="form-input"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email Address</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div className="form-input-wrapper">
              <input
                id="reg-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="form-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-division" className="form-label">Division</label>
            <select
              id="reg-division"
              className="form-input form-select"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="Software">Software</option>
              <option value="SDS">SDS</option>
              <option value="Tekla">Tekla</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reg-role" className="form-label">Account Role</label>
            <select
              id="reg-role"
              className="form-input form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">IT Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? <span className="btn-loader"></span> : 'Create Account'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
