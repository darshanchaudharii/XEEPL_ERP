import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="xe-navbar">
      <div className="xe-left">
        <div className="xe-brand">XEEPL ERP</div>
        <nav className="xe-navlinks">
          <NavLink to="/users" className={({isActive}) => isActive ? 'active' : ''}>Users</NavLink>
          <NavLink to="/sections">Sections</NavLink>
          <NavLink to="/contents">Contents</NavLink>
          <NavLink to="/items">Items</NavLink>
          <NavLink to="/rawmaterials">Raw Materials</NavLink>
          <NavLink to="/catalogs">Catalogs</NavLink>
          <NavLink to="/quotations">Quotations</NavLink>
        </nav>
      </div>
      <div className="xe-right">
        <button className="btn small">Make Quotation</button>
        <button className="btn small">Logout</button>
      </div>
    </header>
  );
}
