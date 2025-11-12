import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import '../../styles/navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const mouseYRef = useRef(0);
  const hideTimeoutRef = useRef(null);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show navbar when at the top (within 10px)
      if (currentScrollY < 10) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Show navbar when scrolling up
      if (currentScrollY < lastScrollY.current) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsVisible(true);
      } 
      // Hide navbar when scrolling down (only if scrolled past 100px and mouse is not near top)
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100 && mouseYRef.current >= 100) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        // Small delay before hiding to prevent flickering
        hideTimeoutRef.current = setTimeout(() => {
          // Double check mouse is still not near top before hiding
          if (mouseYRef.current >= 100 && window.scrollY > 100) {
            setIsVisible(false);
          }
          hideTimeoutRef.current = null;
        }, 200);
      }
      
      lastScrollY.current = currentScrollY;
    };

    const handleMouseMove = (e) => {
      mouseYRef.current = e.clientY;
      
      // Always show navbar when mouse is near the top (within 100px from top)
      if (e.clientY < 100) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsVisible(true);
      }
    };

    // Initialize
    lastScrollY.current = window.scrollY;
    mouseYRef.current = 0;
    setIsVisible(true);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
      <div className="navbar-brand">
        <Link to="/">XEEPL ERP</Link>
      </div>
      <ul className="navbar-menu">
        <li><Link to="/users" className={isActive('/users')}>Users</Link></li>
        <li><Link to="/sections" className={isActive('/sections')}>Sections</Link></li>
        <li><Link to="/contents" className={isActive('/contents')}>Contents</Link></li>
        <li><Link to="/items" className={isActive('/items')}>Items</Link></li>
        <li><Link to="/raw-materials" className={isActive('/raw-materials')}>Raw Materials</Link></li>
        <li><Link to="/catalogs" className={isActive('/catalogs')}>Catalogs</Link></li>
        <li><Link to="/quotations" className={isActive('/quotations')}>Quotations</Link></li>
        <li><Link to="/make-quotation" className={isActive('/make-quotation')}>Make Quotation</Link></li>
        {user && (
          <li className="user-info">
            <span className="user-name">{user.fullName || user.username}</span>
          </li>
        )}
        <li>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;