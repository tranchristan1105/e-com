import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, Lock } from 'lucide-react';

const CartPanel = () => {
  const { isCartOpen, toggleCart, cart, removeFromCart } = useCart();
  
  if (!isCartOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    // 1. DÉFINITION DE L'URL API
    let targetUrl = "http://localhost:8000/api/v1"; // Par défaut (Local)

    try {
      // Si une variable d'environnement est définie (Prod), on l'utilise
      if (import.meta.env.VITE_API_URL) {
        targetUrl = import.meta.env.VITE_API_URL;
      }
    } catch (e) {}

    // 🛡️ SÉCURITÉ : Vérification de l'URL Placeholder
    if (targetUrl.includes("VOTRE-BACKEND") || targetUrl.includes("votre-backend")) {
        alert("ERREUR CONFIGURATION : Vous n'avez pas remplacé l'URL de l'API dans votre fichier .env ou dans le code !\n\nL'URL actuelle est invalide : " + targetUrl);
        return;
    }

    console.log("🔌 Tentative de paiement vers :", targetUrl);

    try {
        // 2. SAUVEGARDE DU PANIER (Pour la page succès)
        localStorage.setItem('last_order_details', JSON.stringify({
            items: cart,
            total: total,
            date: new Date().toISOString()
        }));

        // 3. APPEL API
        const response = await fetch(`${targetUrl}/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Erreur HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        
        if (data.checkout_url) {
            // 4. REDIRECTION STRIPE
            window.location.href = data.checkout_url;
        } else {
            alert("Erreur: Stripe n'a pas renvoyé d'URL de paiement.");
        }
    } catch (error) {
        console.error("❌ Erreur Checkout:", error);
        alert(`Impossible de contacter le serveur de paiement.\nURL: ${targetUrl}\nErreur: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      ></div>
      
      {/* Le Panneau Latéral */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* En-tête */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-3">
             <ShoppingBag size={20} />
             <h2 className="text-lg font-black tracking-widest text-gray-900">PANIER ({cart.length})</h2>
          </div>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24}/>
          </button>
        </div>
        
        {/* Liste des produits */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
                <ShoppingBag size={64} strokeWidth={1} className="opacity-20" />
                <p className="font-medium">Votre panier est vide.</p>
                <button onClick={toggleCart} className="text-black font-bold underline hover:text-blue-600 transition-colors">
                    Découvrir la collection
                </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 relative">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => e.target.src='https://via.placeholder.com/200'}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded inline-block">Quantité: {item.quantity}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="font-bold text-base">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.price)}
                    </p>
                    <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer Panier */}
        {cart.length > 0 && (
            <div className="p-8 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">Total Estimé</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}
                    </span>
                </div>
                <button 
                    onClick={handleCheckout}
                    className="group w-full bg-black text-white h-14 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex justify-center items-center gap-3"
                >
                    <Lock size={16} /> Paiement Sécurisé <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-medium">
                    Expédié sous 24h • Retours Gratuits
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CartPanel;