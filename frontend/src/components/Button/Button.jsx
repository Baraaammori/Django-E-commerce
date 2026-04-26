import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const classes = clsx(
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    { 'btn-full-width': fullWidth },
    { 'btn-loading': isLoading },
    className
  );

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="btn-spinner" />
      ) : (
        <>
          {leftIcon && <span className="btn-icon left">{leftIcon}</span>}
          <span className="btn-text">{children}</span>
          {rightIcon && <span className="btn-icon right">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
