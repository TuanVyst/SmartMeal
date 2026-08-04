const STORAGE_KEY = 'smartmeal_pending_payment';
const PAYMENT_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const pendingPaymentStorage = {
  savePendingPayment: (data) => {
    try {
      if (!data || !data.accountId || !data.orderCode) return;
      const createdAt = Date.now();
      const expiresAt = createdAt + PAYMENT_TTL_MS;
      const payload = {
        accountId: data.accountId,
        plan: data.plan,
        orderCode: data.orderCode,
        qrImage: data.qrImage || '',
        transferContent: data.transferContent || '',
        createdAt,
        expiresAt,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error saving pending payment storage:', e);
    }
  },

  getPendingPayment: (currentAccountId) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);

      if (!parsed || !parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      if (Date.now() >= parsed.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      if (currentAccountId && parsed.accountId !== currentAccountId) {
        return null;
      }

      return parsed;
    } catch (e) {
      console.error('Error reading pending payment storage:', e);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  clearPendingPayment: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing pending payment storage:', e);
    }
  },
};
