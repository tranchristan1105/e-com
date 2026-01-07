import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0c0a09] text-gray-400 py-16 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Colonne Marque */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-serif font-black text-white tracking-widest mb-6 block hover:opacity-80 transition-opacity">
              EMPIRE.
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-light">
              L'excellence à portée de main. Découvrez une sélection exclusive de produits qui redéfinissent les standards du luxe et de la technologie.
            </p>
          </div>
          
          {/* Colonne Boutique */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Boutique</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/" onClick={() => setTimeout(() => document.getElementById('shop')?.scrollIntoView({behavior:'smooth'}), 100)} className="hover:text-white transition-colors">Catalogue</Link></li>
              <li><Link to="/" onClick={() => setTimeout(() => document.getElementById('shop')?.scrollIntoView({behavior:'smooth'}), 100)} className="hover:text-white transition-colors">Best-sellers</Link></li>
            </ul>
          </div>

          {/* Colonne Support */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/shipping" className="hover:text-white transition-colors">Livraison & Retours</Link></li>
              <li><a href="mailto:contact@empire.com" className="hover:text-white transition-colors">Contact</a></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors text-yellow-600">Espace Admin</Link></li>
            </ul>
          </div>

          {/* Colonne Légal */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Légal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/legal" className="hover:text-white transition-colors">Mentions Légales</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">CGV</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Copyright & Réseaux */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-wider text-gray-500">
          <p>© 2025 Empire Inc. Paris • New York • Tokyo</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;