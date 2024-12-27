import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  updateProfile: (data: any) => api.patch('/auth/me', data),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// Tasks API
export const tasks = {
  getAll: (params?: any) => api.get('/tasks', { params }),
  
  getById: (id: string) => api.get(`/tasks/${id}`),
  
  create: (data: any) => api.post('/tasks', data),
  
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data),
  
  delete: (id: string) => api.delete(`/tasks/${id}`),
  
  addComment: (id: string, text: string) =>
    api.post(`/tasks/${id}/comments`, { text }),
  
  getStats: () => api.get('/tasks/stats'),
};

// Users API
export const users = {
  getAll: () => api.get('/users'),
  
  getById: (id: string) => api.get(`/users/${id}`),
  
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
};

export default {
  auth,
  tasks,
  users,
}; 