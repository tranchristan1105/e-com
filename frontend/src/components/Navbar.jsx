import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { toggleCart, cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // Fonction pour naviguer vers le catalogue (scroll fluide)
    const goToShop = () => {
        if (location.pathname === '/') {
            // Si on est déjà sur l'accueil, on scrolle
            const shopSection = document.getElementById('shop');
            if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Sinon, on va sur l'accueil puis on scrolle
            navigate('/');
            setTimeout(() => {
                const shopSection = document.getElementById('shop');
                if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    };
    
    return (
        <nav className="bg-[#0c0a09] text-white border-b border-white/10 sticky top-0 z-40 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="font-serif text-2xl tracking-[0.2em] font-bold hover:text-yellow-500 transition-colors">
                    EMPIRE.
                </Link>
                
                {/* Menu Droite */}
                <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
                    <Link to="/" className="hidden md:block hover:text-yellow-500 transition-colors">Accueil</Link>
                    
                    {/* BOUTON CATALOGUE (Correction ici) */}
                    <button 
                        onClick={goToShop}
                        className="hidden md:block hover:text-yellow-500 transition-colors uppercase font-bold text-xs tracking-widest cursor-pointer bg-transparent border-none p-0"
                    >
                        Catalogue
                    </button>
                    
                    <button 
                        type="button"
                        onClick={toggleCart} 
                        className="flex items-center gap-2 hover:text-yellow-500 transition-colors relative group cursor-pointer"
                    >
                        <div className="relative">
                            <ShoppingBag size={20} />
                            {cart && cart.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-600 text-white text-[9px] flex items-center justify-center rounded-full border border-[#0c0a09]">
                                    {cart.length}
                                </span>
                            )}
                        </div>
                        <span className="hidden md:inline group-hover:underline underline-offset-4 decoration-yellow-500">Panier</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;