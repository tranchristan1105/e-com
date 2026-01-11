import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Calendar, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';

// --- CONFIG API ---
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  
  // États
  const [dbOrder, setDbOrder] = useState(null); // La vraie commande de la BDD
  const [localOrderDetails, setLocalOrderDetails] = useState(null); // Backup localStorage
  const [loadingDb, setLoadingDb] = useState(true);

  // 1. Récupération & Nettoyage Panier
  useEffect(() => {
    try {
        const savedOrder = localStorage.getItem('last_order_details');
        if (savedOrder) {
            setLocalOrderDetails(JSON.parse(savedOrder));
            localStorage.removeItem('last_order_details');
        }
    } catch(e) {}

    if (clearCart) clearCart();
  }, [clearCart]);

  // 2. Récupération de l'ID Réel (Polling)
  useEffect(() => {
    if (!sessionId) {
        setLoadingDb(false);
        return;
    }

    let attempts = 0;
    const maxAttempts = 10; // On essaie pendant 20 secondes (10 * 2s)
    
    const fetchRealOrder = async () => {
        try {
            const res = await fetch(`${API_URL}/orders/by-session/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setDbOrder(data); // On a trouvé la commande !
                setLoadingDb(false);
            } else {
                // Pas encore trouvé (Webhook lent), on réessaie
                if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(fetchRealOrder, 2000);
                } else {
                    setLoadingDb(false); // Tant pis, on affichera les données locales
                }
            }
        } catch (e) {
            console.error("Erreur fetch order", e);
            setLoadingDb(false);
        }
    };

    fetchRealOrder();
  }, [sessionId]);

  // Date estimée (J+3)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  // Données finales à afficher (Priorité à la DB, sinon LocalStorage)
  const displayItems = dbOrder ? [] : (localOrderDetails?.items || []); // Si DB, on n'a pas les items détaillés ici sans une autre requête, donc on utilise le local si dispo pour les images, ou on fait simple.
  // Simplification : On utilise le local pour les images/noms car l'API order simple ne renvoie pas tout le détail produit peuplé.
  const displayTotal = dbOrder ? dbOrder.total : (localOrderDetails?.total || 0);
  const displayId = dbOrder ? `#${dbOrder.id}` : (sessionId ? sessionId.slice(-8).toUpperCase() : "EN ATTENTE");

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 font-sans text-white selection:bg-yellow-600">
      <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
        
        <div className="bg-green-500/10 p-8 text-center border-b border-white/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
             <div className="inline-flex items-center justify-center p-4 bg-green-500/20 rounded-full mb-4 ring-1 ring-green-400/50 shadow-[0_0_40px_rgba(74,222,128,0.2)]">
                <CheckCircle size={48} className="text-green-400" strokeWidth={2} />
             </div>
             <h1 className="font-serif text-3xl md:text-4xl mb-2 tracking-tight text-white">Commande Confirmée</h1>
             <p className="text-green-200/80 text-sm font-medium tracking-wide uppercase">Merci pour votre confiance</p>
        </div>

        <div className="p-8 md:p-12">
            
            <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center text-sm text-gray-400 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                        <span>Référence :</span>
                        {loadingDb && !dbOrder ? (
                            <span className="flex items-center text-yellow-500 gap-2"><RefreshCw size={12} className="animate-spin"/> Validation...</span>
                        ) : (
                            <span className="text-white font-mono font-bold text-lg tracking-wider">{displayId}</span>
                        )}
                    </div>
                    <span className="flex items-center gap-2"><Calendar size={14}/> Livraison : {deliveryDate.toLocaleDateString()}</span>
                </div>

                {/* Liste des produits (Depuis le localStorage pour l'instant car plus riche en infos images) */}
                {localOrderDetails && (
                    <div className="space-y-4">
                        {localOrderDetails.items.map((item, idx) => (
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
                )}

                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                    <span className="text-gray-400 uppercase tracking-widest text-xs font-bold">Total Payé</span>
                    <span className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(displayTotal)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/" className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                    Continuer mes achats
                </Link>
                <a href="mailto:support@empire.com" className="w-full bg-transparent border border-white/20 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    Contacter le support
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;