import api from './api';

export const subscriptionService = {
  getAllPlans: () => api.get('/plan'),
  getSubscriptionsByAccountId: (accountId) => api.get(`/subscription?accountId=${accountId}`),
  createSubscription: (data) => api.post('/subscription', data),
  createPayment: (data) => api.post('/payment/create', data),
  checkPaymentStatus: (orderCode) => api.get(`/payment/check-status/${orderCode}`),
};
