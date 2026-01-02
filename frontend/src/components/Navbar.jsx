import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, BarChart2 } from 'lucide-react';
// Correction : Suppression de l'extension .jsx pour l'import standard
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  
  return (
    // Ajout de backdrop-blur et border-none pour un effet "Flottant"
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors group">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Package size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">E-Shop<span className="text-blue-600">.</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <BarChart2 size={18} />
            <span>Admin</span>
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;