import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!isLogin && formData.password !== formData.password_confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    let success = false;
    
    if (isLogin) {
      success = await login({ email: formData.email, password: formData.password });
    } else {
      success = await register(formData);
    }
    
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="auth-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>
              {isLogin 
                ? 'Enter your credentials to access your account.' 
                : 'Sign up to start shopping premium products.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input 
                  label="Username" 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  leftIcon={<User size={18} />} 
                  required={!isLogin} 
                />
                <Input 
                  label="First Name" 
                  type="text" 
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required={!isLogin} 
                />
                <Input 
                  label="Last Name" 
                  type="text" 
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required={!isLogin} 
                />
              </motion.div>
            )}

            <Input 
              label="Email Address" 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail size={18} />} 
              required 
            />
            
            <Input 
              label="Password" 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} />} 
              required 
            />

            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Input 
                  label="Confirm Password" 
                  type="password" 
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  leftIcon={<Lock size={18} />} 
                  required={!isLogin} 
                />
              </motion.div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <a href="#">Forgot your password?</a>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                className="toggle-auth-btn" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
