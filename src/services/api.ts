import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fretza_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error handler triggers
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    
    if (status === 401) {
      // Token expired or invalid, clear token
      localStorage.removeItem('fretza_token');
      // Dispatch custom event to let stores know
      window.dispatchEvent(new Event('auth-unauthorized'));
    }

    return Promise.reject(
      error.response?.data?.message || error.message || 'API request failed'
    );
  }
);
