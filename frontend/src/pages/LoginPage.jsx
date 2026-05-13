import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { loginUser } from '../api/services';
import { Building2, Eye, EyeOff, Moon, Sun, Palette, Check, ChevronDown } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const { login } = useAuth();
  const { isDarkMode, toggleTheme, colorTheme, changeColorTheme, themes } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      login({
        username,
        division: data.division || 'General',
        role: data.role || 'user',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
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
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-desc">Sign in to manage your bookings</p>

          {error && <div className="alert alert--error">{error}</div>}

          <div className="form-group">
            <label htmlFor="login-username" className="form-label">Username</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <div className="form-input-wrapper">
              <input
                id="login-password"
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loader"></span>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
