import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Tag, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    skills: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit =  async (e) => {
    e.preventDefault();
    setLoading(true);

    const skills = formData.skills 
      ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      : [];

    const result = await signup({
      userName: formData.userName,
      email: formData.email,
      password: formData.password,
      skills,
    });
    
    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card">
          <motion.div 
            className="auth-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1>Create Account</h1>
            <p>Join thousands of teams using AI Ticket Assistant</p>
          </motion.div>

          <motion.form 
            className="auth-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="form-group">
              <label htmlFor="userName">
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="skills">
                <Tag size={18} />
                Skills (Optional)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                className="form-input"
                placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                value={formData.skills}
                onChange={handleChange}
              />
              <small className="form-help">
                Add your skills to help with ticket assignment
              </small>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="loading"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;