import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import './Contact.css';

export const Contact = () => {
  return (
    <div className="contact-page container">
      <motion.div 
        className="contact-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Get in Touch</h1>
        <p>Have a question or need assistance? Our team is here to help.</p>
      </motion.div>

      <div className="contact-layout">
        <motion.div 
          className="contact-info"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2>Contact Information</h2>
          <p className="contact-subtitle">Fill up the form and our Team will get back to you within 24 hours.</p>

          <div className="info-items">
            <div className="info-item">
              <Phone size={20} className="info-icon" />
              <div>
                <h4>Phone</h4>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="info-item">
              <Mail size={20} className="info-icon" />
              <div>
                <h4>Email</h4>
                <p>support@noonpro.com</p>
              </div>
            </div>
            
            <div className="info-item">
              <MapPin size={20} className="info-icon" />
              <div>
                <h4>Headquarters</h4>
                <p>123 Premium Street, Suite 400<br />New York, NY 10001<br />United States</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="contact-form-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <Input label="First Name" required />
              <Input label="Last Name" required />
              <Input label="Email Address" type="email" className="full-width" required />
              <Input label="Subject" className="full-width" required />
            </div>
            
            <div className="input-wrapper full-width">
              <div className="input-container">
                <textarea 
                  className="input-field textarea-field" 
                  placeholder="Your Message..."
                  rows={6}
                  required
                ></textarea>
              </div>
            </div>

            <Button type="submit" size="lg" className="submit-btn" rightIcon={<Send size={18} />}>
              Send Message
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
