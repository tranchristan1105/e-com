import React from 'react';
import { Package, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Colonne Marque */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Package size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight">E-Shop</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              La destination numéro 1 pour les passionnés de technologie. Qualité garantie et service client premium.
            </p>
          </div>

          {/* Colonne Liens */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Nouveautés</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Meilleures Ventes</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Promotions</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Cartes Cadeaux</a></li>
            </ul>
          </div>

          {/* Colonne Aide */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Service Client</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contactez-nous</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Livraison & Retours</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Mentions Légales</a></li>
            </ul>
          </div>

          {/* Colonne Newsletter */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Restez informé</h3>
            <p className="text-sm text-slate-500 mb-4">Recevez nos offres exclusives.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">OK</button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">© 2024 E-Shop Empire. Tous droits réservés.</p>
          <div className="flex gap-6 text-slate-400">
            <Facebook size={20} className="hover:text-blue-600 cursor-pointer transition-colors" />
            <Twitter size={20} className="hover:text-blue-400 cursor-pointer transition-colors" />
            <Instagram size={20} className="hover:text-pink-600 cursor-pointer transition-colors" />
            <Linkedin size={20} className="hover:text-blue-700 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;