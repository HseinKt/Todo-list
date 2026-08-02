import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/axios';

interface User {
  id: string;
  email: string;
  fullName?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  require2Fa: boolean;
  mfaUserId: string | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  verify2Fa: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [require2Fa, setRequire2Fa] = useState<boolean>(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // Just decode or fetch user details
        const { data } = await api.get('/auth/me'); // We can add an endpoint or use token details
        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    
    if (data.data.require2FA) {
      setRequire2Fa(true);
      setMfaUserId(data.data.userId);
      return { require2FA: true };
    }

    const { accessToken, refreshToken, user: loggedUser } = data.data;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(loggedUser);
    return { require2FA: false };
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    await api.post('/auth/signup', { email, password, fullName });
  };

  const verify2Fa = async (code: string) => {
    if (!mfaUserId) return;
    const { data } = await api.post('/auth/2fa/verify', { userId: mfaUserId, code });
    const { accessToken, refreshToken, user: loggedUser } = data.data;
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setUser(loggedUser);
    setRequire2Fa(false);
    setMfaUserId(null);
  };

  const logout = async () => {
    const token = localStorage.getItem('refresh_token');
    if (token) {
      await api.post('/auth/logout', { refreshToken: token }).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        require2Fa,
        mfaUserId,
        login,
        signup,
        verify2Fa,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
