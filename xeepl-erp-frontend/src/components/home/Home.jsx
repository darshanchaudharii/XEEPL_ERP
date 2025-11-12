import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/home.css';

const Home = () => {
  const modules = [
    { name: 'Users', path: '/users', icon: 'fa-users', color: '#1f8a4c' },
    { name: 'Sections', path: '/sections', icon: 'fa-layer-group', color: '#3498db' },
    { name: 'Contents', path: '/contents', icon: 'fa-file-alt', color: '#9b59b6' },
    { name: 'Items', path: '/items', icon: 'fa-box', color: '#e74c3c' },
    { name: 'Raw Materials', path: '/raw-materials', icon: 'fa-cubes', color: '#f39c12' },
    { name: 'Catalogs', path: '/catalogs', icon: 'fa-book', color: '#1abc9c' },
    { name: 'Quotations', path: '/quotations', icon: 'fa-file-invoice', color: '#34495e' },
    { name: 'Make Quotation', path: '/make-quotation', icon: 'fa-plus-circle', color: '#e67e22' }
  ];

  // Helper function to get lighter color variant
  const getLightColor = (color) => {
    const colorMap = {
      '#1f8a4c': '#2ecc71',
      '#3498db': '#5dade2',
      '#9b59b6': '#bb8fce',
      '#e74c3c': '#ec7063',
      '#f39c12': '#f7dc6f',
      '#1abc9c': '#48c9b0',
      '#34495e': '#5d6d7e',
      '#e67e22': '#f39c12'
    };
    return colorMap[color] || '#2ecc71';
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <div className="home-header">
        <h1>Welcome to XEEPL ERP</h1>
        <p>Enterprise Resource Planning System</p>
      </div>

      {/* Modules Section */}
      <div className="modules-section">
        <h2 className="section-title">
          <i className="fas fa-th-large"></i>
          Quick Access Modules
        </h2>
        <div className="modules-grid">
          {modules.map((module) => (
            <Link 
              key={module.path} 
              to={module.path} 
              className="module-card"
              style={{ 
                '--card-color': module.color,
                '--card-color-light': getLightColor(module.color)
              }}
            >
              <div className="module-icon-wrapper">
                <div className="module-icon" style={{ color: module.color }}>
                  <i className={`fas ${module.icon}`}></i>
                </div>
              </div>
              <h3>{module.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h2 className="section-title">
          <i className="fas fa-chart-line"></i>
          System Overview
        </h2>
        <div className="home-stats">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <h4>Total Users</h4>
              <p>Manage system users and their roles</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fas fa-box"></i>
            </div>
            <div className="stat-content">
              <h4>Items</h4>
              <p>Inventory management and tracking</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fas fa-file-invoice"></i>
            </div>
            <div className="stat-content">
              <h4>Quotations</h4>
              <p>Generate and manage quotations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;