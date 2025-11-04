import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/navbar.css';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
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
        <li><Link to="/logout" className="logout">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;