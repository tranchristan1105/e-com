import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des modules avec extensions explicites pour la résolution
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/Navbar.jsx';
import CartPanel from './components/CartPanel.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import CancelPage from './pages/CancelPage.jsx';
//trig
export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-blue-100">
          <Navbar />
          <CartPanel />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* ROUTES PAIEMENT */}
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}