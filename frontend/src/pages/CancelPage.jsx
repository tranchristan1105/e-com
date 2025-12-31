import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart } from 'lucide-react';

const CancelPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="text-red-600 w-10 h-10" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Paiement Annulé</h1>
        <p className="text-slate-500 mb-8">
          Vous n'avez pas été débité. Vous pouvez réessayer le paiement ou continuer vos achats.
        </p>

        <Link 
          to="/" 
          className="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Retourner au panier
        </Link>

      </div>
    </div>
  );
};

export default CancelPage;