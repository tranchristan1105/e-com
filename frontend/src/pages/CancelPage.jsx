import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';

const CancelPage = () => {
  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 font-sans text-white selection:bg-red-600">
      <div className="max-w-lg w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        
        {/* Effet de fond */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <XCircle size={40} className="text-red-500" strokeWidth={1.5} />
            </div>

            <h1 className="font-serif text-3xl md:text-4xl mb-4 tracking-tight">Paiement Annulé</h1>
            <p className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
                Aucun montant n'a été débité. La transaction a été interrompue ou refusée par la banque.
            </p>

            <div className="flex flex-col gap-4 w-full">
                <Link 
                    to="/cart" // Ou ouvrir le panier
                    onClick={() => window.history.back()}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors"
                >
                    Réessayer le paiement
                </Link>
                
                <Link 
                    to="/" 
                    className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-500 hover:text-white border border-transparent hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={14} /> Retour boutique
                </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 w-full">
                <p className="text-xs text-gray-500 mb-3">Besoin d'aide ?</p>
                <a href="mailto:support@empire.com" className="text-xs font-bold text-white hover:text-yellow-500 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={14} /> Contacter le support
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;