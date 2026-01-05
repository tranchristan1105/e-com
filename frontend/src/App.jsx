import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { CartProvider, useCart } from './context/CartContext';
import { MarketingPixels } from './components/MarketingPixels';
import CartPanel from './components/CartPanel';
import AnalyticsTracker from './components/AnalyticsTracker';

import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/DashboardPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import { LegalNotice, TermsOfSales, PrivacyPolicy, ShippingPolicy } from './pages/LegalPages';

// NAVBAR AVEC COMPTEUR CORRIGÉ
const Navbar = () => {
    const { toggleCart, cartCount } = useCart(); // On utilise cartCount !
    
    return (
        <nav className="bg-[#0c0a09] text-white border-b border-white/10 sticky top-0 z-40 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="font-serif text-2xl tracking-[0.2em] font-bold hover:text-yellow-500 transition-colors">
                    EMPIRE.
                </Link>
                
                <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
                    <Link to="/" className="hidden md:block hover:text-yellow-500 transition-colors">Accueil</Link>
                    <Link to="/legal" className="hidden md:block hover:text-yellow-500 transition-colors">Légal</Link>
                    
                    <button 
                        type="button"
                        onClick={toggleCart} 
                        className="flex items-center gap-2 hover:text-yellow-500 transition-colors relative group cursor-pointer"
                    >
                        <div className="relative">
                            <ShoppingBag size={20} />
                            {/* AFFICHAGE DU COMPTEUR */}
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-600 text-white text-[9px] flex items-center justify-center rounded-full border border-[#0c0a09]">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="hidden md:inline group-hover:underline underline-offset-4 decoration-yellow-500">Panier</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
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
        <AnalyticsTracker />
        <MarketingPixels />
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
        </div>
      </Router>
    </CartProvider>
  );
}