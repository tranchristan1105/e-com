import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Import des contextes et composants
import { CartProvider } from './context/CartContext';
import { MarketingPixels } from './components/MarketingPixels';
import Navbar from './components/Navbar';
import CartPanel from './components/CartPanel';

// Import des Pages Principales
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/DashboardPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';

// Import des Pages Légales
import { LegalNotice, TermsOfSales, PrivacyPolicy, ShippingPolicy } from './pages/LegalPages';

// Composant Bandeau Promo
const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  
  return (
    <div className="bg-black text-white text-xs md:text-sm py-2.5 px-4 text-center relative z-[60]">
      <span className="font-medium">🎉 OFFRE DE LANCEMENT : </span>
      <span className="text-gray-300">Livraison offerte dès 50€ </span>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <Router>
        {/* On injecte les pixels ici pour qu'ils aient accès au Router */}
        <MarketingPixels />
        
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white flex flex-col">
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: { background: '#333', color: '#fff', borderRadius: '8px', fontSize: '14px' },
              success: { iconTheme: { primary: '#fff', secondary: '#333' } },
            }}
          />
          
          <PromoBanner />
          <Navbar /> 
          <CartPanel />
          
          <div className="flex-1">
            <Routes>
                {/* Routes Principales */}
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/cancel" element={<CancelPage />} />

                {/* Routes Légales High-End */}
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="/terms" element={<TermsOfSales />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/shipping" element={<ShippingPolicy />} />
            </Routes>
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}