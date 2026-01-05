import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  
  // État local pour stocker les infos de la commande affichée
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // 1. Récupérer les infos sauvegardées AVANT de vider le panier
    // On utilise un try/catch pour éviter tout crash si le JSON est invalide
    try {
        const savedOrder = localStorage.getItem('last_order_details');
        if (savedOrder) {
            setOrderDetails(JSON.parse(savedOrder));
            // On ne supprime PAS tout de suite du localStorage pour éviter que ça disparaisse au refresh trop vite
            // On peut le laisser, il sera écrasé à la prochaine commande
        }
    } catch(e) {
        console.error("Erreur lecture commande", e);
    }

    // 2. Vider le panier global (CartContext)
    if (clearCart) {
      clearCart();
    }
  }, [clearCart]);

  // Date estimée de livraison (J+3)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 font-sans text-white selection:bg-yellow-600">
      <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
        
        {/* Bannière de Succès */}
        <div className="bg-green-500/10 p-8 text-center border-b border-white/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
             <div className="inline-flex items-center justify-center p-4 bg-green-500/20 rounded-full mb-4 ring-1 ring-green-400/50 shadow-[0_0_40px_rgba(74,222,128,0.2)]">
                <CheckCircle size={48} className="text-green-400" strokeWidth={2} />
             </div>
             <h1 className="font-serif text-3xl md:text-4xl mb-2 tracking-tight text-white">Commande Confirmée</h1>
             <p className="text-green-200/80 text-sm font-medium tracking-wide uppercase">Merci pour votre confiance</p>
        </div>

        <div className="p-8 md:p-12">
            
            {/* Détails de la commande récupérés */}
            {orderDetails ? (
                <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center text-sm text-gray-400 border-b border-white/10 pb-4">
                        <span>Référence : <span className="text-white font-mono">{sessionId ? sessionId.slice(-8).toUpperCase() : "CMD-" + Math.floor(Math.random()*10000)}</span></span>
                        <span className="flex items-center gap-2"><Calendar size={14}/> Livraison estimée : {deliveryDate.toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-4">
                        {orderDetails.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} onError={(e) => e.target.src='https://via.placeholder.com/100'}/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-200 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-500">Quantité : {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-mono text-yellow-500 whitespace-nowrap">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.price)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-white/10">
                        <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Total Payé</span>
                        <span className="text-2xl font-bold text-white">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(orderDetails.total)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500 mb-8 py-8 border border-dashed border-white/10 rounded-xl">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Le récapitulatif est indisponible (Session expirée ou accès direct).</p>
                    <p className="text-xs mt-1">Vérifiez vos emails pour le détail complet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                    to="/" 
                    className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                    Continuer mes achats
                </Link>
                <a 
                    href="mailto:support@empire.com"
                    className="w-full bg-transparent border border-white/20 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                    Contacter le support
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;