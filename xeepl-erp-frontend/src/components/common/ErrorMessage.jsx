import React from 'react';
import '../../styles/global.css';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <i className="fas fa-exclamation-circle"></i>
      <span>{message}</span>
      {onClose && (
        <button className="error-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;