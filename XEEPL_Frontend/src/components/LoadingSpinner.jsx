import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 40 }) {
  return (
    <div className="loading-overlay" role="status">
      <div className="loader" style={{ width: size, height: size }}></div>
    </div>
  );
}
