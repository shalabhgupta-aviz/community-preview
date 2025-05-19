import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const AlertBox = ({ message, type, onClose }) => {
  const alertStyles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`p-4 mb-4 ${alertStyles[type]} rounded flex items-center`}
      role="alert"
    >
      <div className="flex items-center w-full">
        <span className="flex items-center">
          <span className="mr-2">
            {type === 'success' && '✔️'}
            {type === 'error' && '❌'}
            {type === 'warning' && '⚠️'}
            {type === 'info' && 'ℹ️'}
          </span>
          {message}
        </span>
      </div>
    </motion.div>
  );
};

export default AlertBox;
