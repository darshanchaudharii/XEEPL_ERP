import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="xe-footer">
      <div>© {new Date().getFullYear()} XEEPL ERP</div>
      <div>React User Module</div>
    </footer>
  );
}
