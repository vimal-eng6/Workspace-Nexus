import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateProfile, sendTestEmail } from '../api/services';
import { 
  User, 
  Mail, 
  Building, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Send
} from 'lucide-react';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.username) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const profile = await getUserProfile(user.username);
      setEmail(profile.email || '');
      setDivision(profile.division || 'Software');
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(user.username, email, division);
      setMessage({ type: 'success', text: 'Profile updated successfully! ✅' });
      
      // Update local auth context too (including email)
      login({ ...user, email, division });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setMessage({ type: '', text: '' });
    try {
      await sendTestEmail(user.username, email);
      setMessage({ type: 'success', text: 'Test email sent! Check your inbox. 📬' });
    } catch (err) {
      setMessage({ type: 'error', text: `Email failed: ${err.message}. Make sure your App Password is correct.` });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spin" size={32} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <User size={28} /> My Profile
          </h1>
          <p className="page-desc">Manage your account information and preferences</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleUpdate}>
          {message.text && (
            <div className={`alert alert--${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="form-input" style={{ opacity: 0.7, background: 'var(--bg-secondary)' }}>
              {user.username} (Cannot be changed)
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-email" className="form-label">
              <Mail size={16} /> Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              We'll use this to send you booking confirmations.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="profile-division" className="form-label">
              <Building size={16} /> Division
            </label>
            <select
              id="profile-division"
              className="form-input form-select"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              <option value="Software">Software</option>
              <option value="SDS">SDS</option>
              <option value="Tekla">Tekla</option>
            </select>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn btn--secondary" 
              onClick={handleTestEmail}
              disabled={testing || !email}
              style={{ flex: 1 }}
            >
              {testing ? <Loader2 size={18} className="spin" /> : <><Send size={18} /> Verify Email Settings</>}
            </button>

            <button 
              type="submit" 
              className="btn btn--primary" 
              disabled={saving}
              style={{ flex: 1.5 }}
            >
              {saving ? (
                <span className="btn-loader"></span>
              ) : (
                <>
                  <Save size={18} /> Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
