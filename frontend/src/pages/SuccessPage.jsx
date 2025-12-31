import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
// Ajout de l'extension .jsx pour corriger l'erreur de résolution
import { useCart } from '../context/CartContext.jsx';
// import { useTracking } from '../hooks/useTracking'; // Optionnel si tu veux tracker la vente

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  useEffect(() => {
    // Dès que la page charge, on vide le panier car la commande est payée
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Merci pour votre commande !</h1>
        <p className="text-slate-500 mb-8">
          Votre paiement a été accepté. Vous allez recevoir un email de confirmation avec les détails de la livraison.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-sm text-slate-600 border border-slate-200">
          <p className="font-semibold mb-1">Numéro de session :</p>
          <code className="bg-white px-2 py-1 rounded border border-slate-200 text-xs break-all">
            {sessionId || "ID_INCONNU"}
          </code>
        </div>

        <div className="space-y-3">
          <Link 
            to="/" 
            className="block w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Retour à la boutique <ArrowRight size={20} />
          </Link>
          
          <button className="block w-full text-slate-500 py-3 font-medium hover:text-slate-700 text-sm">
            Besoin d'aide ? Contactez le support
          </button>
        </div>

      </div>
    </div>
  );
};

export default SuccessPage;