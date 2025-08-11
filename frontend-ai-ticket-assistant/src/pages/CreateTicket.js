import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  MessageSquare,
  Sparkles,
  CheckCircle 
} from 'lucide-react';
import { ticketsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './CreateTicket.css';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ticketsAPI.createTicket(formData);
      
      setSuccess(true);
      toast.success('Ticket created successfully! AI is processing your request.');
      
      // Reset form
      setFormData({ title: '', description: '' });
      
      // Redirect after a delay to show success state
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create ticket';
      toast.error(errorMessage);
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (success) {
    return (
      <motion.div 
        className="create-ticket-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="success-container">
          <motion.div 
            className="success-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle size={48} />
            </motion.div>
            <h2>Ticket Created Successfully!</h2>
            <p>
              Your ticket has been submitted and our AI is already analyzing it. 
              You'll be redirected to your tickets page shortly.
            </p>
            <div className="ai-processing">
              <Sparkles size={16} />
              <span>AI is processing your request...</span>
              <div className="processing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="create-ticket-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="create-ticket-container">
        <motion.div className="page-header" variants={itemVariants}>
          <button 
            className="back-btn"
            onClick={() => navigate('/tickets')}
          >
            <ArrowLeft size={18} />
            Back to Tickets
          </button>
          <div className="header-content">
            <h1>Create New Ticket</h1>
            <p>Describe your issue and our AI will help route it to the right team</p>
          </div>
        </motion.div>

        <div className="form-layout">
          <motion.div className="form-section" variants={itemVariants}>
            <form onSubmit={handleSubmit} className="ticket-form">
              <div className="form-group">
                <label htmlFor="title">
                  <FileText size={18} />
                  Ticket Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  placeholder="Brief description of your issue..."
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <small className="form-help">
                  Be specific and concise. Good titles help with faster resolution.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <MessageSquare size={18} />
                  Detailed Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input form-textarea"
                  placeholder="Please provide as much detail as possible about your issue. Include steps to reproduce, error messages, expected vs actual behavior, etc."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={8}
                />
                <small className="form-help">
                  The more details you provide, the better our AI can analyze and route your ticket.
                </small>
              </div>

              <motion.button
                type="submit"
                className="btn btn-primary submit-btn"
                disabled={loading || !formData.title.trim() || !formData.description.trim()}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="loading"></div>
                    Creating Ticket...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Create Ticket
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div className="info-section" variants={itemVariants}>
            <div className="info-card">
              <div className="info-icon">
                <Sparkles size={24} />
              </div>
              <h3>AI-Powered Processing</h3>
              <p>
                Once you submit your ticket, our advanced AI will:
              </p>
              <ul>
                <li>Analyze your issue and determine priority</li>
                <li>Identify the required skills for resolution</li>
                <li>Assign to the most qualified team member</li>
                <li>Provide helpful notes and potential solutions</li>
              </ul>
            </div>

            <div className="tips-card">
              <h4>💡 Tips for Better Tickets</h4>
              <ul>
                <li><strong>Be specific:</strong> Include exact error messages</li>
                <li><strong>Provide context:</strong> What were you trying to do?</li>
                <li><strong>List steps:</strong> How can we reproduce the issue?</li>
                <li><strong>Include screenshots:</strong> Visual aids help a lot</li>
                <li><strong>Mention urgency:</strong> How critical is this issue?</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateTicket;