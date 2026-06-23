import axios from 'axios';
const apiEndpont = import.meta.env.VITE_BASE_URL ?? 'http://localhost:5267/api';

const api = axios.create({
  baseURL: `${apiEndpont}`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
