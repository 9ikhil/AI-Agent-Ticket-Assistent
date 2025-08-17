import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
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
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  signup: (userData) => api.post("/auth/signup", userData),
  logout: () => api.get("/auth/logout"),
  getUsers: () => api.get("/auth/users"), // Admin only
  createAdmin: (userData) => api.post("/auth/create-admin", userData),
  createModerator: (userData) => api.post("/auth/create-moderator", userData),
};


// Enhanced Tickets API
export const ticketsAPI = {
  // Get all tickets (filtered by user role)
  getTickets: () => {
    console.log('Fetching tickets...');
    return api.get('/tickets');
  },
  
  // Get single ticket with full details
  getTicket: (id) => {
    console.log(`Fetching ticket details for ID: ${id}`);
    return api.get(`/tickets/${id}`);
  },
  
  // Create new ticket
  createTicket: (ticketData) => {
    console.log('Creating ticket:', ticketData);
    return api.post('/tickets', ticketData);
  },
  
  // Update ticket status (admin/moderator only)
  updateTicketStatus: (id, statusData) => {
    console.log(`Updating ticket ${id} status:`, statusData);
    return api.put(`/tickets/${id}/status`, statusData);
  },
  
  // Assign ticket to user (admin only)
  assignTicket: (id, assignmentData) => {
    console.log(`Assigning ticket ${id}:`, assignmentData);
    return api.put(`/tickets/${id}/assign`, assignmentData);
  }
}

export const userAPI = {
  promoteToModerator: (email) => api.post('/auth/promote-to-moderator', { email }),
  promoteToAdmin: (email) => 
    api.post('/auth/promote-to-admin', { email }),
};


export const apiUtils = {
  // Set auth token
  setAuthToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  // Remove auth token
  removeAuthToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  // Set current user in localStorage
  setCurrentUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Format date for display
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Format relative date (e.g., "2 hours ago")
  formatRelativeDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  },
  
  // Get status color
  getStatusColor: (status) => {
    switch (status) {
      case 'open':
        return '#ed8936';
      case 'in-progress':
        return '#3182ce';
      case 'closed':
        return '#38a169';
      default:
        return '#718096';
    }
  },
  
  // Get priority color
  getPriorityColor: (priority) => {
    switch (priority) {
      case 'high':
        return '#e53e3e';
      case 'medium':
        return '#ed8936';
      case 'low':
        return '#38a169';
      default:
        return '#718096';
    }
  }
};


export default api;
