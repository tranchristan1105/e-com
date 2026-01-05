import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';

// --- CONFIGURATION API DYNAMIQUE ---
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

const CartPanel = () => {
  const { isCartOpen, toggleCart, cart, removeFromCart } = useCart();
  
  if (!isCartOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
        const response = await fetch(`${API_URL}/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        } else {
            alert("Erreur: Pas d'URL de redirection reçue de Stripe");
        }
    } catch (error) {
        console.error("Erreur checkout:", error);
        alert(`Impossible de contacter le serveur de paiement (${API_URL}). Vérifiez la console.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      ></div>
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <h2 className="text-xl font-black tracking-widest text-gray-900">VOTRE PANIER ({cart.length})</h2>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24}/>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <ShoppingBag size={48} className="text-gray-200" />
                <p className="text-gray-400 font-medium">Votre panier est vide.</p>
                <button onClick={toggleCart} className="text-sm font-bold underline hover:text-black transition-colors">
                    Continuer mes achats
                </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => e.target.src='https://via.placeholder.com/200'}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 font-medium">Quantité: {item.quantity}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="font-bold text-sm">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.price)}
                    </p>
                    <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Retirer du panier"
                    >
                        <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-bold text-sm uppercase tracking-wide">Total Estimé</span>
                    <span className="text-2xl font-black text-gray-900">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}
                    </span>
                </div>
                <button 
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] flex justify-center items-center gap-2"
                >
                    Procéder au paiement
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
                    Paiement Sécurisé SSL • Expédition 24h
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CartPanel;