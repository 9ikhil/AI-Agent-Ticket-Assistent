import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  User,

  Calendar,
  ArrowRight,
  X,
  Mail,
  Star,
  MessageCircle,
  Tag,
  Users,
  Brain,
  Activity
} from 'lucide-react';
import { userAPI } from '../services/api';
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
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [promoting, setPromoting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await ticketsAPI.getTickets();
      console.log('Tickets response:', response.data); // Debug log
      setTickets(response.data.tickets || []);
    } catch (error) {
      toast.error('Failed to fetch tickets');
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };


  const handlePromoteToModerator = async () => {
  if (!promoteEmail.trim()) return;
  setPromoting(true);
  
  try {
    await userAPI.promoteToModerator(promoteEmail);
    setPromoteEmail('');
    setShowPromoteModal(false);
    toast.success(`User ${promoteEmail} promoted to moderator successfully!`);
  } catch (error) {
    toast.error('Failed to promote user. Please check the email address.');
  } finally {
    setPromoting(false);
  }
};

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await ticketsAPI.getTicket(ticketId);
      setSelectedTicket(response.data.ticket);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to fetch ticket details');
      console.error('Error fetching ticket details:', error);
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

  const getAssignedUserInfo = (ticket) => {
    if (ticket.assignedTo) {
      // If assignedTo is populated with user object
      if (typeof ticket.assignedTo === 'object') {
        return {
          name: ticket.assignedTo.userName || 'Unknown User',
          email: ticket.assignedTo.email || '',
          id: ticket.assignedTo._id || ticket.assignedTo
        };
      }
      // If assignedTo is just an ID
      return {
        name: 'Assigned',
        email: '',
        id: ticket.assignedTo
      };
    }
    return null;
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

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
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
    <>
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
              filteredTickets.map((ticket) => {
                const assignedUser = getAssignedUserInfo(ticket);
                
                return (
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

                    {/* Enhanced assigned user section */}
                    {assignedUser && (
                      <div className="ticket-assigned">
                        <div className="assigned-user">
                          <Users size={14} />
                          <span className="assigned-label">Assigned to:</span>
                          <span className="assigned-name">{assignedUser.name}</span>
                          {assignedUser.email && (
                            <span className="assigned-email">({assignedUser.email})</span>
                          )}
                        </div>
                      </div>
                    )}

                    {ticket.helpfulNotes && (
                      <div className="ticket-notes">
                        <Brain size={14} />
                        <strong>AI Notes:</strong> {ticket.helpfulNotes.substring(0, 100)}...
                      </div>
                    )}

                    <div className="ticket-footer">
                      <div className="ticket-meta">
                        <div className="meta-item">
                          <Calendar size={14} />
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
                          <div className="meta-item">
                            <Tag size={14} />
                            {ticket.relatedSkills.length} skills
                          </div>
                        )}
                      </div>
                      
                      <motion.button 
                        className="view-ticket-btn"
                        whileHover={{ x: 5 }}
                        onClick={() => fetchTicketDetails(ticket._id)}
                      >
                        View Details
                        <ArrowRight size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Ticket Details Modal */}
      <AnimatePresence>
        {showModal && selectedTicket && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className="ticket-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">
                  <h2>{selectedTicket.title}</h2>
                  <div className="modal-status">
                    {getStatusIcon(selectedTicket.status)}
                    <span>{selectedTicket.status}</span>
                  </div>
                </div>
                <button className="modal-close" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>

              <div className="modal-content">
                <div className="modal-section">
                  <h3><MessageCircle size={18} /> Description</h3>
                  <p className="ticket-full-description">{selectedTicket.description}</p>
                </div>

                <div className="modal-meta-grid">
                  <div className="meta-card">
                    <Activity size={16} />
                    <div>
                      <span className="meta-label">Priority</span>
                      <span 
                        className="meta-value priority"
                        style={{ color: getPriorityColor(selectedTicket.priority) }}
                      >
                        {selectedTicket.priority || 'Medium'}
                      </span>
                    </div>
                  </div>

                  <div className="meta-card">
                    <Calendar size={16} />
                    <div>
                      <span className="meta-label">Created</span>
                      <span className="meta-value">
                        {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {selectedTicket.assignedTo && (
                    <div className="meta-card">
                      <Users size={16} />
                      <div>
                        <span className="meta-label">Assigned To</span>
                        <span className="meta-value">
                          {typeof selectedTicket.assignedTo === 'object' 
                            ? selectedTicket.assignedTo.userName 
                            : 'Assigned User'}
                        </span>
                        {typeof selectedTicket.assignedTo === 'object' && selectedTicket.assignedTo.email && (
                          <span className="meta-email">{selectedTicket.assignedTo.email}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTicket.category && (
                    <div className="meta-card">
                      <Tag size={16} />
                      <div>
                        <span className="meta-label">Category</span>
                        <span className="meta-value">{selectedTicket.category}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedTicket.relatedSkills && selectedTicket.relatedSkills.length > 0 && (
                  <div className="modal-section">
                    <h3><Star size={18} /> Related Skills</h3>
                    <div className="skills-list">
                      {selectedTicket.relatedSkills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicket.helpfulNotes && (
                  <div className="modal-section">
                    <h3><Brain size={18} /> AI Analysis & Notes</h3>
                    <div className="ai-notes">
                      <p>{selectedTicket.helpfulNotes}</p>
                    </div>
                  </div>
                )}

                {selectedTicket.suggestedActions && selectedTicket.suggestedActions.length > 0 && (
                  <div className="modal-section">
                    <h3><ArrowRight size={18} /> Suggested Actions</h3>
                    <ul className="suggested-actions">
                      {selectedTicket.suggestedActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTicket.potentialCauses && selectedTicket.potentialCauses.length > 0 && (
                  <div className="modal-section">
                    <h3><AlertCircle size={18} /> Potential Causes</h3>
                    <ul className="potential-causes">
                      {selectedTicket.potentialCauses.map((cause, index) => (
                        <li key={index}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-section">
                  <div className="ticket-timeline">
                    <h3><Clock size={18} /> Timeline</h3>
                    <div className="timeline-item">
                      <div className="timeline-date">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </div>
                      <div className="timeline-event">Ticket created</div>
                    </div>
                    {selectedTicket.updatedAt && selectedTicket.updatedAt !== selectedTicket.createdAt && (
                      <div className="timeline-item">
                        <div className="timeline-date">
                          {new Date(selectedTicket.updatedAt).toLocaleString()}
                        </div>
                        <div className="timeline-event">Last updated</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>
                {selectedTicket.assignedTo && typeof selectedTicket.assignedTo === 'object' && selectedTicket.assignedTo.email && (
                  <a 
                    href={`mailto:${selectedTicket.assignedTo.email}?subject=Regarding Ticket: ${selectedTicket.title}`}
                    className="btn btn-primary"
                  >
                    <Mail size={16} />
                    Contact Assignee
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        
          {showPromoteModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowPromoteModal(false)}
          >
            <motion.div 
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-purple-900">Promote User to Moderator</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Enter the email address of the user you want to promote to moderator role.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email Address
                </label>
                <input
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                <div className="flex items-start">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This action will grant moderator privileges to the specified user.
                      Make sure the email address is correct.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPromoteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoteToModerator}
                  disabled={promoting || !promoteEmail.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {promoting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Promoting...
                    </>
                  ) : (
                    'Promote to Moderator'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
    
       
     
    
    </>
    
  );
};

export default Tickets;