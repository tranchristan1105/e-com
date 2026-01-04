import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, Zap, 
  TrendingUp, Check, Play, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- CONFIGURATION API ---
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

// --- COMPOSANTS UI ---
const Badge = ({ children, color = "bg-black" }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${color} text-white tracking-widest uppercase mb-4 shadow-sm`}>
    {children}
  </span>
);

const ProductCard = ({ product }) => {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 border border-gray-100">
      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => e.target.src='https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80'}
        />
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
          <Link 
            to={`/product/${product.id}`}
            className="w-full bg-white text-black font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all shadow-lg text-sm"
          >
            <ShoppingBag size={16} /> Voir le produit
          </Link>
        </div>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.id % 2 === 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">-20%</span>}
            <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            {product.category}
            </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-base text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="font-bold text-sm">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}</span>
        </div>
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">({Math.floor(Math.random() * 50) + 10})</span>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100">
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black shadow-sm mb-4 border border-gray-100">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{desc}</p>
  </div>
);

// --- PAGE D'ACCUEIL ---

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (e) {
        console.error("Erreur API", e);
        // Fallback data
        setProducts([
            {id: 1, name: "Empire Edition Gold", price: 1299, category: "Premium", image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"},
            {id: 2, name: "Casque Audio Pro", price: 349, category: "Audio", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"},
            {id: 3, name: "Sneakers Limited", price: 199, category: "Mode", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"},
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900">
      
      {/* BANDEAU TOP (URGENCE) */}
      <div className="bg-black text-white text-xs font-bold text-center py-2 px-4 tracking-widest uppercase flex justify-center items-center gap-2">
        <Clock size={12} className="animate-pulse text-yellow-400"/>
        <span>Vente Flash : -20% sur tout le site jusqu'à minuit</span>
      </div>

      {/* 1. HERO SECTION (L'effet Whaou) */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-[#0f172a]">
        {/* Background Image avec Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase">Collection 2025</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white leading-none mb-8 tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              LE FUTUR EST <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">DÉJÀ ICI.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Ne suivez pas la tendance. Créez-la. Découvrez une sélection exclusive de produits qui redéfinissent les standards du luxe et de la technologie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <button 
                onClick={() => document.getElementById('shop').scrollIntoView({behavior: 'smooth'})}
                className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Découvrir maintenant <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REASSURANCE STRIP (Confiance) */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-6 py-4">
            <div className="flex justify-around items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                <span className="flex items-center gap-2"><Truck size={14} className="text-black"/> Livraison Gratuite</span>
                <span className="flex items-center gap-2 hidden sm:flex"><ShieldCheck size={14} className="text-black"/> Garantie 2 Ans</span>
                <span className="flex items-center gap-2"><Zap size={14} className="text-black"/> Expédition 24H</span>
            </div>
        </div>
      </div>

      {/* 3. CATALOGUE (Grid Produits) */}
      <section id="shop" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16 text-center">
            <Badge color="bg-blue-600">Populaire</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Nos Best-Sellers</h2>
            <p className="text-gray-500 text-lg max-w-lg">Les produits que tout le monde s'arrache en ce moment. Attention, stocks limités.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <a href="#" className="inline-flex items-center font-bold text-black border-b-2 border-black pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors">
              VOIR TOUT LE CATALOGUE <ArrowRight className="ml-2" size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 4. SOCIAL PROOF (Avis) */}
      <section className="py-24 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="p-8 bg-gray-50 rounded-2xl">
                      <div className="flex justify-center text-yellow-400 mb-4"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                      <p className="text-gray-800 font-medium italic mb-4">"Qualité incroyable. J'ai reçu ma commande en 2 jours seulement. Je recommande à 100%."</p>
                      <p className="text-xs font-bold uppercase text-gray-400">Thomas L. - Paris</p>
                  </div>
                  <div className="p-8 bg-gray-50 rounded-2xl border border-blue-100 shadow-lg shadow-blue-50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">VERIFIÉ</div>
                      <div className="flex justify-center text-yellow-400 mb-4"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                      <p className="text-gray-800 font-medium italic mb-4">"Le service client est ultra réactif. Produit conforme et packaging de luxe. Merci !"</p>
                      <p className="text-xs font-bold uppercase text-gray-400">Sarah M. - Lyon</p>
                  </div>
                  <div className="p-8 bg-gray-50 rounded-2xl">
                      <div className="flex justify-center text-yellow-400 mb-4"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                      <p className="text-gray-800 font-medium italic mb-4">"Exactement ce que je cherchais. Design épuré et finitions parfaites."</p>
                      <p className="text-xs font-bold uppercase text-gray-400">Maxime D. - Bordeaux</p>
                  </div>
              </div>
          </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="bg-black text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black text-white tracking-widest">EMPIRE.</div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <Link to="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link to="/terms" className="hover:text-white transition-colors">CGV</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link to="/shipping" className="hover:text-white transition-colors">Livraison</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors text-blue-500">Admin</Link>
          </div>
          <div className="text-xs text-gray-600">
            © 2025 Empire Inc.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;