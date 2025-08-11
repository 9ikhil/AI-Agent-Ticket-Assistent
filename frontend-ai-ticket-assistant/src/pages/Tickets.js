import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Tickets.css';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketsAPI.getTickets();
      setTickets(response.data.tickets || []);
    } catch (error) {
      toast.error('Failed to fetch tickets');
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} className="status-icon status-open" />;
      case 'in-progress':
        return <Clock size={16} className="status-icon status-progress" />;
      case 'closed':
        return <CheckCircle size={16} className="status-icon status-closed" />;
      default:
        return <AlertCircle size={16} className="status-icon" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'var(--secondary)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--text-muted)';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (loading) {
    return (
      <div className="tickets-page">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="tickets-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="tickets-container">
        <motion.div className="tickets-header" variants={itemVariants}>
          <div className="header-content">
            <h1>Your Tickets</h1>
            <p>Manage and track all your support tickets</p>
          </div>
          <Link to="/create-ticket" className="btn btn-primary">
            <Plus size={18} />
            Create Ticket
          </Link>
        </motion.div>

        <motion.div className="tickets-filters" variants={itemVariants}>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-item">
              <Filter size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="filter-item">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div className="tickets-stats" variants={itemVariants}>
          <div className="stat-card">
            <div className="stat-number">{tickets.length}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {tickets.filter(t => t.status === 'open').length}
            </div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {tickets.filter(t => t.status === 'in-progress').length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {tickets.filter(t => t.status === 'closed').length}
            </div>
            <div className="stat-label">Closed</div>
          </div>
        </motion.div>

        <motion.div className="tickets-grid" variants={containerVariants}>
          {filteredTickets.length === 0 ? (
            <motion.div className="empty-state" variants={itemVariants}>
              <div className="empty-icon">🎫</div>
              <h3>No tickets found</h3>
              <p>
                {tickets.length === 0 
                  ? "You haven't created any tickets yet. Create your first ticket to get started!"
                  : "No tickets match your current filters. Try adjusting your search criteria."
                }
              </p>
              {tickets.length === 0 && (
                <Link to="/create-ticket" className="btn btn-primary">
                  <Plus size={18} />
                  Create Your First Ticket
                </Link>
              )}
            </motion.div>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                className="ticket-card"
                variants={itemVariants}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="ticket-header">
                  <div className="ticket-status">
                    {getStatusIcon(ticket.status)}
                    <span className="status-text">{ticket.status}</span>
                  </div>
                  <div 
                    className="ticket-priority"
                    style={{ color: getPriorityColor(ticket.priority) }}
                  >
                    {ticket.priority || 'medium'}
                  </div>
                </div>

                <div className="ticket-content">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-description">
                    {ticket.description.length > 150 
                      ? `${ticket.description.substring(0, 150)}...`
                      : ticket.description
                    }
                  </p>
                </div>

                {ticket.helpfulNotes && (
                  <div className="ticket-notes">
                    <strong>AI Notes:</strong> {ticket.helpfulNotes.substring(0, 100)}...
                  </div>
                )}

                <div className="ticket-footer">
                  <div className="ticket-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                    {ticket.assignedTo && (
                      <div className="meta-item">
                        <User size={14} />
                        Assigned
                      </div>
                    )}
                  </div>
                  
                  <motion.button 
                    className="view-ticket-btn"
                    whileHover={{ x: 5 }}
                  >
                    View Details
                    <ArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Tickets;