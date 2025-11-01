import React from 'react';
import './modals.css';

export default function ConfirmModal({ visible, title='Confirm', message, onCancel, onConfirm }) {
  if (!visible) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
