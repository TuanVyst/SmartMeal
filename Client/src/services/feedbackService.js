import api from './api';

export const feedbackService = {
  createFeedback: (data) => api.post('/feedback', data),
  getMyFeedbacks: () => api.get('/feedback/my'),
  getAdminFeedbacks: (params = {}) => api.get('/feedback/admin', { params }),
  getAdminFeedbackById: (id) => api.get(`/feedback/admin/${id}`),
  replyAdminFeedback: (id, data) => api.put(`/feedback/admin/${id}/reply`, data),
  deleteAdminFeedback: (id) => api.delete(`/feedback/admin/${id}`),
};
