import React from 'react';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
// Ajout de l'extension .jsx pour corriger l'erreur de résolution
import { useCart } from '../context/CartContext.jsx';

const CartPanel = () => {
  const { cart, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
      />
      
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Mon Panier ({cart.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Votre panier est vide.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                <div className="h-16 w-16 bg-white rounded-md flex items-center justify-center border border-gray-100">
                   <img src={item.image_url} alt={item.name} className="h-12 w-12 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                  <p className="text-blue-600 font-bold">{item.price} €</p>
                </div>
                <button 
                  onClick={() => removeFromCart(idx)}
                  className="text-gray-400 hover:text-red-500 p-2 hover:bg-white rounded-full transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between text-xl font-bold mb-6 text-gray-900">
            <span>Total</span>
            <span>{cartTotal.toFixed(2)} €</span>
          </div>
          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-200">
            Passer la commande
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;