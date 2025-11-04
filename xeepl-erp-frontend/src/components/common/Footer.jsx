import React from 'react';
import '../../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} XEEPL ERP. All rights reserved.</p>
        <p>Powered by Tronsoftech</p>
      </div>
    </footer>
  );
};

export default Footer;