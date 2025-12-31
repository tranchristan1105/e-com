import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, BarChart2 } from 'lucide-react';
// Ajout de l'extension .jsx pour aider la résolution du module
import { useCart } from '../context/CartContext.jsx';

const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Package size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">E-Shop</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            <BarChart2 size={18} />
            <span>Admin</span>
          </Link>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:text-blue-600 transition-all hover:bg-gray-50 rounded-full"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
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