import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import { pendingPaymentStorage } from '../utils/pendingPaymentStorage';
import { toast } from 'react-hot-toast';

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

  const checkPremiumStatus = useCallback(async (accountId) => {
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
        pendingPaymentStorage.clearPendingPayment();
      } else {
        setSubscription(null);
        setIsPremium(false);
      }
    } catch (err) {
      console.error('Error checking premium status:', err);
      setSubscription(null);
      setIsPremium(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = readStoredUser();
    const accId = storedUser?.accountId || storedUser?.account_id;
    if (accId) checkPremiumStatus(accId);
  }, [checkPremiumStatus]);

  const accountId = user?.accountId || user?.account_id;

  const checkPendingPaymentStatus = useCallback(async () => {
    const accId = user?.accountId || user?.account_id;
    if (!accId) return false;
    const pending = pendingPaymentStorage.getPendingPayment(accId);
    if (!pending || !pending.orderCode) return false;

    try {
      const { data } = await subscriptionService.checkPaymentStatus(pending.orderCode);
      if (data && data.success && data.isPaid) {
        pendingPaymentStorage.clearPendingPayment();
        await checkPremiumStatus(accId);
        toast.success('🎉 Thanh toán thành công! Tài khoản của bạn đã được nâng cấp lên Pro.');
        return true;
      }
    } catch {
      /* ignore polling errors */
    }
    return false;
  }, [user, checkPremiumStatus]);

  useEffect(() => {
    if (!accountId || isPremium) return;

    // Initial check
    checkPendingPaymentStatus();

    // Interval polling every 4 seconds if pending payment exists
    const interval = setInterval(() => {
      const pending = pendingPaymentStorage.getPendingPayment(accountId);
      if (pending) {
        checkPendingPaymentStatus();
      }
    }, 4000);

    // Visibility change handler (switching back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const pending = pendingPaymentStorage.getPendingPayment(accountId);
        if (pending) {
          checkPendingPaymentStatus();
        } else {
          checkPremiumStatus(accountId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [accountId, isPremium, checkPendingPaymentStatus, checkPremiumStatus]);

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
    pendingPaymentStorage.clearPendingPayment();
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
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, register, verifyRegisterOtp, googleLogin, logout, updateAvatar, subscription, isPremium, checkPremiumStatus, checkPendingPaymentStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

