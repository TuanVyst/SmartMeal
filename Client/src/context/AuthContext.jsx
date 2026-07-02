import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  const checkPremiumStatus = async (accountId) => {
    if (!accountId) {
      setSubscription(null);
      setIsPremium(false);
      return;
    }
    try {
      const { data } = await subscriptionService.getSubscriptionsByAccountId(accountId);
      const subs = data.data || [];
      const now = new Date();
      // Find first active and valid subscription
      const activeSub = subs.find(s => 
        s.status === 'active' && 
        (!s.endDate || new Date(s.endDate) > now)
      );

      if (activeSub) {
        setSubscription(activeSub);
        setIsPremium(true);
      } else {
        setSubscription(null);
        setIsPremium(false);
      }
    } catch (err) {
      console.error('Error checking premium status:', err);
      setSubscription(null);
      setIsPremium(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const accId = parsedUser.accountId || parsedUser.account_id;
      if (accId) {
        checkPremiumStatus(accId);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    if (data.requiresOtp) return data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    const accId = data.accountId || data.account_id;
    if (accId) await checkPremiumStatus(accId);
    return data;
  };

  const verifyOtp = async (email, otpCode) => {
    const { data } = await authService.verifyOtp({ email, otpCode });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    const accId = data.accountId || data.account_id;
    if (accId) await checkPremiumStatus(accId);
    return data;
  };

  const register = async (credentials) => {
    const { data } = await authService.register(credentials);
    if (data.requiresOtp) return data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    const accId = data.accountId || data.account_id;
    if (accId) await checkPremiumStatus(accId);
    return data;
  };

  const verifyRegisterOtp = async (email, otpCode) => {
    const { data } = await authService.verifyRegisterOtp({ email, otpCode });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    const accId = data.accountId || data.account_id;
    if (accId) await checkPremiumStatus(accId);
    return data;
  };

  const googleLogin = async (idToken) => {
    const { data } = await authService.googleLogin(idToken);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    const accId = data.accountId || data.account_id;
    if (accId) await checkPremiumStatus(accId);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSubscription(null);
    setIsPremium(false);
  };

  const updateAvatar = async (avatarUrl) => {
    const { data } = await authService.updateAvatar(avatarUrl);
    const updatedUser = { ...user, avatar: data.avatarUrl ?? avatarUrl };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, register, verifyRegisterOtp, googleLogin, logout, updateAvatar, subscription, isPremium, checkPremiumStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
