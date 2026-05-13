import { useState, useEffect } from 'react';
import { getUsers } from '../api/services';
import { Users, Mail, Building, Shield } from 'lucide-react';

export default function DirectoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const defaultUsername = u.username || '';
    const defaultDivision = u.division || '';
    return (
      defaultUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defaultDivision.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="page-container page-enter" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* VIBRANT HERO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        borderRadius: '24px',
        padding: '40px 50px',
        color: '#fff',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Global Directory</h1>
          <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9, maxWidth: '600px' }}>
            Connect safely and easily with everyone across all divisions. Search for teammates, managers, and cross-functional partners instantly.
          </p>
          
          <div style={{ marginTop: '30px', background: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '12px', display: 'flex', maxWidth: '500px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
            <input
              type="text"
              placeholder="Search by name or division..."
              style={{
                flex: 1,
                padding: '15px 20px',
                border: 'none',
                background: 'transparent',
                color: '#1e293b',
                fontSize: '1rem',
                outline: 'none'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={{ background: '#fff', color: '#8b5cf6', padding: '0 20px', display: 'flex', alignItems: 'center', borderRadius: '8px', fontWeight: 'bold' }}>
              Search
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading directory...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <div className="error-icon">!</div>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {filteredUsers.map((user, idx) => {
            // Pick a dynamic gradient for the avatar
            const gradients = [
              'linear-gradient(135deg, #f43f5e, #fb923c)',
              'linear-gradient(135deg, #3b82f6, #2dd4bf)',
              'linear-gradient(135deg, #8b5cf6, #d946ef)',
              'linear-gradient(135deg, #10b981, #3b82f6)'
            ];
            const gIdx = user.username ? user.username.charCodeAt(0) % 4 : 0;
            const bgGradient = gradients[gIdx];

            return (
              <div 
                key={user.id} 
                className="directory-card card" 
                style={{ 
                  borderRadius: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  background: 'var(--bg-card-solid)', 
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {/* Top Banner of the card */}
                <div style={{ height: '80px', background: bgGradient, borderTopLeftRadius: '20px', borderTopRightRadius: '20px', position: 'relative' }}>
                  {/* Floating Avatar */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-30px', 
                    left: '25px', 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '20px', 
                    background: 'var(--bg-card-solid)', 
                    border: '3px solid var(--bg-card-solid)',
                    color: 'var(--text-primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '28px', 
                    fontWeight: '800',
                    boxShadow: 'var(--shadow-sm)',
                    transform: 'rotate(-5deg)'
                  }}>
                    {(user.username || '?').charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: '40px 25px 25px 25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{user.username || 'Unknown User'}</h3>
                      <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {user.division || 'General Operations'}
                      </span>
                    </div>
                    {user.role === 'admin' && (
                      <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={12} /> ADMIN
                      </div>
                    )}
                  </div>
                  
                  <div style={{ height: '1px', background: 'var(--border)', margin: '5px 0' }}></div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', background: 'var(--bg-elevated)', padding: '10px 15px', borderRadius: '12px' }}>
                      <div style={{ background: 'var(--bg-card-solid)', padding: '6px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                        <Mail size={16} color="var(--accent)" /> 
                      </div>
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || 'No email provided'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '14px', background: 'var(--bg-elevated)', padding: '10px 15px', borderRadius: '12px' }}>
                      <div style={{ background: 'var(--bg-card-solid)', padding: '6px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                        <Building size={16} color="var(--accent)" /> 
                      </div>
                      <span style={{ flex: 1 }}>{user.division || 'Headquarters'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '80px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px' }}>
              <Users size={64} style={{ opacity: 0.2, margin: '0 auto 20px auto' }} />
              <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>No Results Found</h2>
              <p>We couldn't find any colleagues matching "{searchTerm}".</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
