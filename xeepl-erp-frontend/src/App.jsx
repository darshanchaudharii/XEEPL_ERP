import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './components/home/Home';
import AdminLogin from './components/auth/AdminLogin';
import UserMaster from './components/users/UserMaster';
import SectionMaster from './components/sections/SectionMaster';
import ContentMaster from './components/contents/ContentMaster';
import ItemMaster from './components/items/ItemMaster';
import RawMaterialMaster from './components/rawmaterials/RawMaterialMaster';
import CatalogMaster from './components/catalogs/CatalogMaster';
import QuotationMaster from './components/quotations/QuotationMaster';
import MakeQuotation from './components/quotations/MakeQuotation';
import QuotationView from './components/quotations/QuotationView';
import { authService } from './services/authService';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/users" element={<UserMaster />} />
            <Route path="/sections" element={<SectionMaster />} />
            <Route path="/contents" element={<ContentMaster />} />
            <Route path="/items" element={<ItemMaster />} />
            <Route path="/raw-materials" element={<RawMaterialMaster />} />
            <Route path="/catalogs" element={<CatalogMaster />} />
            <Route path="/quotations" element={<QuotationMaster />} />
            <Route path="/make-quotation" element={<MakeQuotation />} />
            <Route path="/quotations/:id" element={<QuotationView />} />
          </Routes>
        </main>
        <Footer />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
