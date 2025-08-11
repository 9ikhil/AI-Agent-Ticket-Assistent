import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Zap, 
  BarChart3, 
  Link as LinkIcon, 
  TrendingUp, 
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI automatically analyzes tickets, determines priority, and provides helpful solutions to speed up resolution times.',
      gradient: 'var(--gradient)',
    },
    {
      icon: Zap,
      title: 'Smart Assignment',
      description: 'Intelligent routing assigns tickets to team members based on their skills and expertise, ensuring optimal resolution quality.',
      gradient: 'var(--gradient-2)',
    },
    {
      icon: BarChart3,
      title: 'Real-time Tracking',
      description: 'Monitor ticket progress in real-time with detailed status updates and automated notifications for all stakeholders.',
      gradient: 'var(--gradient-3)',
    },
    {
      icon: LinkIcon,
      title: 'Seamless Integration',
      description: 'Connect with your existing tools and workflows through our comprehensive API and webhook integrations.',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Gain insights into team performance, resolution patterns, and customer satisfaction with detailed analytics.',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption, role-based access control, and compliance certifications.',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    },
  ];

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

  return (
    <div className="home">
      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="hero-content">
          <motion.div variants={itemVariants} className="hero-badge">
            <Sparkles size={16} />
            <span>AI-Powered Support System</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="hero-title">
            Revolutionize Your
            <span className="gradient-text"> Support Workflow</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="hero-description">
            Streamline your support workflow with intelligent ticket routing, 
            automated prioritization, and smart assignment to the right team members. 
            Experience the future of customer support today.
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/create-ticket" className="btn btn-primary hero-btn">
                  Create Your First Ticket
                  <ArrowRight size={18} />
                </Link>
                <Link to="/tickets" className="btn btn-outline hero-btn">
                  View Your Tickets
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary hero-btn">
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline hero-btn">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="hero-stats">
            <div className="stat">
              <div className="stat-number">50%</div>
              <div className="stat-label">Faster Resolution</div>
            </div>
            <div className="stat">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">AI Assistance</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <div className="features-content">
          <motion.div variants={itemVariants} className="features-header">
            <h2>Powerful Features for Modern Support</h2>
            <p>Everything you need to deliver exceptional customer support</p>
          </motion.div>

          <motion.div variants={containerVariants} className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="feature-card"
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.2 }
                }}
              >
                <div 
                  className="feature-icon"
                  style={{ background: feature.gradient }}
                >
                  <feature.icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <motion.div 
                  className="feature-arrow"
                  whileHover={{ x: 5 }}
                >
                  <ArrowRight size={16} />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="cta-content">
          <motion.h2 variants={itemVariants}>
            Ready to Transform Your Support?
          </motion.h2>
          <motion.p variants={itemVariants}>
            Join thousands of teams already using AI Ticket Assistant to deliver 
            exceptional customer support experiences.
          </motion.p>
          <motion.div variants={itemVariants} className="cta-buttons">
            {isAuthenticated ? (
              <Link to="/create-ticket" className="btn btn-primary cta-btn">
                Create Your First Ticket
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary cta-btn">
                  Start Free Trial
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline cta-btn">
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
