import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header.js';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AnimatedBackground from './components/UI/AnimatedBackground';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AnimatedBackground />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/tickets" 
                element={
                  <ProtectedRoute>
                    <Tickets />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-ticket" 
                element={
                  <ProtectedRoute>
                    <CreateTicket />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #6366f1',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f43f5e',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;