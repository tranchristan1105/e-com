import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, Zap, 
  TrendingUp, Check, Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Configuration API (même logique que le dashboard)
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

// --- COMPOSANTS UI ---

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black text-white tracking-widest uppercase mb-4">
    {children}
  </span>
);

const ProductCard = ({ product }) => {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-transparent hover:border-gray-100">
      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => e.target.src='https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80'}
        />
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center p-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
          <Link 
            to={`/product/${product.id}`}
            className="w-full bg-white text-black font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all shadow-lg"
          >
            <ShoppingBag size={18} /> Voir le produit
          </Link>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {product.category}
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <span className="font-bold text-lg">{product.price} €</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
          {product.description || "Une expérience unique de qualité supérieure."}
        </p>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-400 ml-2">(48 avis)</span>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100">
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-md mb-4 group-hover:scale-110 transition-transform">
      <Icon size={28} strokeWidth={1.5} />
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
        // Fallback data si l'API est éteinte pour la démo
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
      
      {/* 1. HERO SECTION (L'effet Whaou) */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-[#0f172a]">
        {/* Background Image avec Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Nouvelle Collection</span>
              <span className="text-gray-300 text-sm font-medium">Hiver 2025</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              L'Excellence <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">à portée de main.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Découvrez des produits conçus pour ceux qui refusent les compromis. Design intemporel, technologie de pointe et durabilité exceptionnelle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <button 
                onClick={() => document.getElementById('shop').scrollIntoView({behavior: 'smooth'})}
                className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Explorer la boutique <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                <Play size={18} className="fill-white" /> Voir le film
              </button>
            </div>

            {/* Social Proof Hero */}
            <div className="mt-12 flex items-center gap-4 text-sm font-medium text-gray-400 animate-in fade-in duration-1000 delay-500">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a] bg-gray-600 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p>Rejoignez <span className="text-white font-bold">12,000+</span> clients satisfaits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REASSURANCE (Marques / Confiance) */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos fictifs pour l'exemple */}
            <h3 className="text-xl font-black text-gray-800 tracking-tighter">TECHCRUNCH</h3>
            <h3 className="text-xl font-black text-gray-800 tracking-tighter">FORBES</h3>
            <h3 className="text-xl font-black text-gray-800 tracking-tighter">WIRED</h3>
            <h3 className="text-xl font-black text-gray-800 tracking-tighter">THE VERGE</h3>
          </div>
        </div>
      </div>

      {/* 3. CATALOGUE (Grid Produits) */}
      <section id="shop" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <Badge>Tendance</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">Nos Best-Sellers</h2>
              <p className="text-gray-500 mt-2 text-lg">Les pièces les plus convoitées du moment.</p>
            </div>
            <a href="#" className="hidden md:flex items-center font-bold text-blue-600 hover:text-blue-800 transition-colors group">
              Voir tout le catalogue <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </a>
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
          
          <div className="mt-12 text-center md:hidden">
            <a href="#" className="inline-flex items-center font-bold text-blue-600">
              Voir tout le catalogue <ArrowRight className="ml-2" size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* 4. FEATURES (Pourquoi nous ?) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Pourquoi choisir Empire ?</h2>
            <p className="text-gray-500 text-lg">Nous ne vendons pas seulement des produits, nous vendons une expérience d'achat sans friction.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={Truck} 
              title="Livraison Express & Gratuite" 
              desc="Recevez vos commandes en 24/48h. La livraison est offerte sans minimum d'achat." 
            />
            <FeatureItem 
              icon={ShieldCheck} 
              title="Garantie Satisfaction" 
              desc="30 jours pour changer d'avis. Retour gratuit et remboursement immédiat." 
            />
            <FeatureItem 
              icon={Zap} 
              title="Support Premium" 
              desc="Une équipe dédiée disponible 7j/7 pour répondre à toutes vos questions." 
            />
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER / FOOTER CTA */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Rejoignez le club privé.</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Accédez à nos ventes privées et recevez <strong>-10% sur votre première commande</strong> en vous inscrivant.
          </p>
          
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4" onSubmit={(e) => { e.preventDefault(); toast.success('Bienvenue dans le club !'); }}>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              required
            />
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-600/30">
              S'inscrire
            </button>
          </form>
          
          <p className="text-xs text-gray-500 mt-6">
            En vous inscrivant, vous acceptez nos conditions générales. Pas de spam, promis.
          </p>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="bg-black text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold text-white tracking-widest">EMPIRE.</div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">À propos</a>
            <a href="#" className="hover:text-white transition-colors">Boutique</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <Link to="/dashboard" className="hover:text-white transition-colors text-blue-500">Admin</Link>
          </div>
          <div className="text-xs">
            © 2024 Empire Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;