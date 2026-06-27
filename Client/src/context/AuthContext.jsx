import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    if (data.requiresOtp) return data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const verifyOtp = async (email, otpCode) => {
    const { data } = await authService.verifyOtp({ email, otpCode });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (credentials) => {
    const { data } = await authService.register(credentials);
    if (data.requiresOtp) return data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const verifyRegisterOtp = async (email, otpCode) => {
    const { data } = await authService.verifyRegisterOtp({ email, otpCode });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const googleLogin = async (idToken) => {
    const { data } = await authService.googleLogin(idToken);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateAvatar = async (avatarUrl) => {
    const { data } = await authService.updateAvatar(avatarUrl);
    const updatedUser = { ...user, avatar: data.avatarUrl ?? avatarUrl };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, register, verifyRegisterOtp, googleLogin, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
