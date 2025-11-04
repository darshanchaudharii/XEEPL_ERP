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

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to XEEPL ERP</h1>
        <p>Enterprise Resource Planning System</p>
      </div>

      <div className="modules-grid">
        {modules.map((module) => (
          <Link 
            key={module.path} 
            to={module.path} 
            className="module-card"
            style={{ borderTopColor: module.color }}
          >
            <div className="module-icon" style={{ color: module.color }}>
              <i className={`fas ${module.icon}`}></i>
            </div>
            <h3>{module.name}</h3>
          </Link>
        ))}
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <i className="fas fa-users"></i>
          <div>
            <h4>Total Users</h4>
            <p>Manage system users</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-box"></i>
          <div>
            <h4>Items</h4>
            <p>Inventory management</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fas fa-file-invoice"></i>
          <div>
            <h4>Quotations</h4>
            <p>Generate quotes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;