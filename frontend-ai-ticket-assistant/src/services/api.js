import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
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
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.get('/auth/logout'),
};

// Tickets API
export const ticketsAPI = {
  getTickets: () => api.get('/tickets'),
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
};

export default api;