import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      return JSON.parse(storedUser);
    }
  } catch {
    // Ignore invalid stored auth data
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const storedUser = readStoredUser();
    const accId = storedUser?.accountId || storedUser?.account_id;
    if (accId) checkPremiumStatus(accId);
  }, []);

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
      const activeSubs = subs
        .filter(s => s.status === 'active' && (!s.endDate || new Date(s.endDate) > now))
        .sort((a, b) => {
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(b.endDate) - new Date(a.endDate);
        });
      const activeSub = activeSubs[0] || null;

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
    localStorage.removeItem('userHealthProfile');
    localStorage.removeItem('healthSurveyCompleted');
    setUser(null);
    setSubscription(null);
    setIsPremium(false);
  };

  const updateAvatar = async (avatarFile) => {
    const { data } = await authService.updateAvatar(avatarFile);
    const updatedUser = { ...user, avatar: data.avatarUrl ?? user?.avatar };
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
