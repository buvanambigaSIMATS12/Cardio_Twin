import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const getBaseURL = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // USB Direct Method matching client zip configuration:
  // Use localhost:8000 so adb reverse or local laptop testing works universally without hardcoded Wi-Fi IPs
  if (Capacitor.isNativePlatform()) {
    return 'http://localhost:8000';
  }
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:8000`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if JWT expires
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getMediaURL = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const clean = url.replace('uploads/', '').replace('static/', '');
  return `${api.defaults.baseURL}/static/${clean}`;
};

export default api;
