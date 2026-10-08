import axios from 'axios';

const apiEndpoint = import.meta.env.VITE_BASE_URL || '';

const api = axios.create({
  baseURL: apiEndpoint ? `${apiEndpoint}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ message: 'Request timeout', status: 408, originalError: error });
    }
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.title || `Server error (${status})`;
      return Promise.reject({ message, status, data, originalError: error });
    }
    if (error.request) {
      return Promise.reject({ message: 'Network error - no response from server', status: 0, originalError: error });
    }
    return Promise.reject({ message: error.message || 'Unknown error', status: -1, originalError: error });
  }
);

export const predictImage = async (formData) => {
  const targetUrl = apiEndpoint ? `${apiEndpoint}/predict` : '/predict';
  return fetch(targetUrl, {
    method: 'POST',
    body: formData,
  });
};

export default api;
