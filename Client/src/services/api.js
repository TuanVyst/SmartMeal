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
      if (status === 401 && !error.config?.url?.includes('/auth/login') && !error.config?.url?.includes('/auth/verify')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
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
  const aiEnvUrl = import.meta.env.VITE_AI_URL || '';
  const isLocalBackend =
    apiEndpoint.includes('localhost:5267') ||
    apiEndpoint.includes('127.0.0.1:5267');
  const primaryUrl = aiEnvUrl
    ? `${aiEnvUrl.replace(/\/$/, '')}/predict`
    : isLocalBackend || !apiEndpoint
      ? '/predict'
      : `${apiEndpoint.replace(/\/$/, '')}/predict`;

  try {
    const res = await fetch(primaryUrl, {
      method: 'POST',
      body: formData,
    });
    if (res.ok || primaryUrl !== '/predict') {
      return res;
    }
  } catch (err) {
    if (primaryUrl !== '/predict') {
      throw err;
    }
  }

  // Fallback to direct local AI service on port 8000 if Vite proxy is unavailable
  return fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: formData,
  });
};

export default api;
