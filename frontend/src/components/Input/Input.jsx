import React, { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import './Input.css';

export const Input = React.forwardRef(({
  label,
  error,
  success,
  className,
  type = 'text',
  placeholder,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    if (props.onBlur) props.onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    if (props.onChange) props.onChange(e);
  };

  const inputClasses = clsx(
    'input-field',
    { 'input-error': error },
    { 'input-success': success && !error },
    { 'input-filled': hasValue },
    className
  );

  return (
    <div className="input-wrapper">
      <div className="input-container">
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={placeholder || " "}
          {...props}
        />
        {label && (
          <label className={clsx('floating-label', { 'label-active': isFocused || hasValue })}>
            {label}
          </label>
        )}
        
        {/* Validation Icons */}
        <div className="input-icon-right">
          {error && <AlertCircle size={18} className="icon-error" />}
          {success && !error && <CheckCircle size={18} className="icon-success" />}
        </div>
      </div>
      
      {/* Error Message */}
      <motion.div 
        className="input-feedback"
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: error ? 1 : 0, 
          height: error ? 'auto' : 0 
        }}
      >
        {error && <span className="error-text">{error}</span>}
      </motion.div>
    </div>
  );
});

Input.displayName = 'Input';
