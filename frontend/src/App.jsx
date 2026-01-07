import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Imports des Contextes & Composants
import { CartProvider } from './context/CartContext';
import { MarketingPixels } from './components/MarketingPixels';
import CartPanel from './components/CartPanel';
import Navbar from './components/Navbar';
import AnalyticsTracker from './components/AnalyticsTracker';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/DashboardPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import { LegalNotice, TermsOfSales, PrivacyPolicy, ShippingPolicy } from './pages/LegalPages';
import Footer from './components/Footer';

// --- Mocks pour l'aperçu (A supprimer chez vous) ---


// --- BANDEAU PROMO ---
const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  if (!isVisible) return null;
  return (
    <div className="bg-yellow-600 text-white text-[10px] font-bold py-2 px-4 text-center relative z-50 tracking-[0.15em] uppercase">
      <span className="opacity-90">Livraison offerte dès 50€ d'achat • Expédition 24h</span>
      <button onClick={() => setIsVisible(false)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-black transition-colors"><X size={14} /></button>
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <Router>
        <MarketingPixels />
        <AnalyticsTracker />
        
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-600 selection:text-white flex flex-col">
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: { background: '#0c0a09', color: '#fff', borderRadius: '0px', border: '1px solid #333' },
              success: { iconTheme: { primary: '#ca8a04', secondary: '#fff' } },
            }}
          />
          
          <PromoBanner />
          <Navbar /> 
          <CartPanel />
         
          
          <div className="flex-1">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/cancel" element={<CancelPage />} />
                <Route path="/legal" element={<LegalNotice />} />
                <Route path="/terms" element={<TermsOfSales />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/shipping" element={<ShippingPolicy />} />
            </Routes>
          </div>
          <Footer />
        </div>
        
      </Router>
    </CartProvider>
  );
}