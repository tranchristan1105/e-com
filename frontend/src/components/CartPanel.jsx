import React, { useState } from 'react';
import { X, ShoppingCart, Trash2, CreditCard, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast'; // <--- IMPORT

// Gestion sécurisée URL
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

const CartPanel = () => {
  const { cart, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    // Petit toast de chargement
    const loadingToast = toast.loading('Préparation du paiement...');
    
    try {
        const response = await fetch(`${API_URL}/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });
        
        const data = await response.json();
        
        // On ferme le toast de chargement
        toast.dismiss(loadingToast);

        if (data.checkout_url) {
            window.location.href = data.checkout_url;
        } else {
            toast.error("Erreur technique lors de la commande.");
            setIsProcessing(false);
        }
    } catch (error) {
        toast.dismiss(loadingToast);
        console.error("Erreur Checkout:", error);
        toast.error("Impossible de contacter le serveur.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
      />
      
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBagIcon size={20} />
            Mon Panier ({cart.length})
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 opacity-50 flex flex-col items-center">
              <ShoppingCart size={64} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-400">Votre panier est vide.</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-blue-600 hover:underline">Continuer mes achats</button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="h-16 w-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                   <img src={item.image_url} alt={item.name} className="h-12 w-12 object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                  <p className="text-blue-600 font-bold">{item.price} €</p>
                </div>
                <button 
                  onClick={() => removeFromCart(idx)}
                  className="text-gray-300 hover:text-red-500 p-2 hover:bg-gray-50 rounded-full transition-all"
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
          
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2
                ${cart.length === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
          >
            {isProcessing ? (
                <>
                    <Loader className="animate-spin" size={24} />
                    Préparation...
                </>
            ) : (
                <>
                    <CreditCard size={24} />
                    Payer Maintenant
                </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
            <LockIcon size={12} /> Paiement 100% Sécurisé via Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

const ShoppingBagIcon = (props) => <ShoppingCart {...props} />;
const LockIcon = ({size}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export default CartPanel;