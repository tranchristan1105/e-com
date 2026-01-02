import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Import des modules (Correction : Retrait des extensions pour la résolution standard)
import { CartProvider } from './context/CartContext';
import { MarketingPixels } from './components/MarketingPixels';
import Navbar from './components/Navbar';
import CartPanel from './components/CartPanel';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/DashboardPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';

// Composant Bandeau Promo
const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  if (!isVisible) return null;
  
  return (
    <div className="bg-slate-900 text-white text-xs md:text-sm py-2.5 px-4 text-center relative z-[60]">
      <span className="font-medium">🎉 OFFRE DE LANCEMENT : </span>
      <span className="text-slate-300">Livraison offerte dès 50€ d'achat avec le code </span>
      <span className="font-bold text-white border-b border-white/30 ml-1">BIENVENUE</span>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
        
        <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-blue-100 flex flex-col">
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: { background: '#333', color: '#fff', borderRadius: '10px' },
              success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
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
            </Routes>
          </div>
        </div>
      </Router>
    </CartProvider>
  );
}