import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

// Import des modules avec extensions explicites .jsx (Nécessaire ici)
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/Navbar.jsx';
import CartPanel from './components/CartPanel.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import CancelPage from './pages/CancelPage.jsx';

// Composant Bandeau Promo
const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
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
        <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-blue-100 flex flex-col">
          {/* Le Toaster peut être placé n'importe où */}
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: 'white',
                },
              },
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