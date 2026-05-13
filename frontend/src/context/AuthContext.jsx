import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('officesync_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('officesync_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('officesync_user');
    }
  }, [user]);

  // Sync with backend on load to ensure latest role/division
  useEffect(() => {
    if (user?.username) {
      const syncProfile = async () => {
        try {
          const { getUserProfile } = await import('../api/services');
          const latest = await getUserProfile(user.username);
          if (latest) {
            setUser(prev => ({ ...prev, ...latest }));
          }
        } catch (err) {
          console.error('Auth sync failed');
        }
      };
      syncProfile();
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
