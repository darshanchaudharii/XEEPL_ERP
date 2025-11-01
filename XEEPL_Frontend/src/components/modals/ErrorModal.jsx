import React from 'react';
import './modals.css';

export default function ErrorModal({ visible, title='Error', message, onClose }) {
  if (!visible) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
