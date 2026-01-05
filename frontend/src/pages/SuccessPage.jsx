import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  // Récupération sécurisée du contexte
  const cartContext = useCart();
  
  useEffect(() => {
    // On vide le panier UNIQUEMENT si la fonction existe pour éviter le crash
    if (cartContext && cartContext.clearCart) {
      cartContext.clearCart();
    } else {
       // Optionnel: On peut vider le localStorage manuellement en secours
       localStorage.removeItem('empire_cart');
    }
  }, [cartContext]);

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 font-sans text-white selection:bg-yellow-600">
      <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        
        {/* Effet de fond */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
            </div>

            <h1 className="font-serif text-3xl md:text-4xl mb-4 tracking-tight">Commande Confirmée</h1>
            <p className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
                Merci pour votre confiance. Votre commande a été acceptée et est en cours de préparation dans nos ateliers.
            </p>

            <div className="bg-white/5 border border-white/5 rounded-xl p-6 w-full mb-8">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Référence Commande</p>
                <p className="font-mono text-yellow-500 text-lg">{sessionId ? sessionId.slice(-8).toUpperCase() : "CONFIRMÉE"}</p>
            </div>

            <Link 
                to="/" 
                className="group w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-yellow-500 hover:text-white transition-all duration-500 flex items-center justify-center gap-3"
            >
                Retour à la boutique <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;