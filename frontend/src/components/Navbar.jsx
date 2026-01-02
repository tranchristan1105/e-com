import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, BarChart2, Menu, X } from 'lucide-react'; // Ajout icônes Menu
import { useCart } from '../context/CartContext'; // Import standard sans extension

const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors group z-50">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/30">
            <Package size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">E-Shop<span className="text-blue-600">.</span></span>
        </Link>
        
        {/* ACTIONS (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6 text-sm font-semibold text-slate-600">
            <a href="#collection" className="hover:text-blue-600 transition-colors">Collection</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Nouveautés</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Promotions</a>
          </nav>

          <div className="h-6 w-px bg-slate-200"></div>

          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <BarChart2 size={18} />
            <span>Admin</span>
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-white animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="flex items-center gap-4 md:hidden">
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-600"
            >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {cart.length}
                </span>
                )}
            </button>
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-900"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
            <a href="#collection" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Collection</a>
            <a href="#" className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Nouveautés</a>
            <a href="#" className="text-lg font-bold text-slate-900 py-2 border-b border-slate-50">Promotions</a>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-blue-600 py-2 flex items-center gap-2">
                <BarChart2 size={20} /> Espace Admin
            </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;