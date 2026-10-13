import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: hydrate from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('hh_token');
    const storedUser = localStorage.getItem('hh_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('hh_token');
        localStorage.removeItem('hh_user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Persist login data to state and localStorage.
   * @param {object} userData  - { id, name, email, role, ... }
   * @param {string} authToken - JWT
   */
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('hh_token', authToken);
    localStorage.setItem('hh_user', JSON.stringify(userData));
  };

  /**
   * Clear auth state and localStorage.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hh_token');
    localStorage.removeItem('hh_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Convenience hook for consuming AuthContext.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
