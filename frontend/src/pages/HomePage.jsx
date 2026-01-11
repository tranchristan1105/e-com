import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, Zap, 
  Utensils, ChefHat, Sparkles, MoveRight, XCircle, CheckCircle, Clock, AlertTriangle
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

// --- COMPOSANTS UI "GASTRO" ---

const GoldButton = ({ children, onClick, className = "" }) => (
  <button 
    onClick={onClick}
    className={`bg-white text-black font-extrabold uppercase tracking-[0.15em] px-8 py-4 rounded-sm hover:bg-yellow-500 hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] transform hover:-translate-y-1 ${className}`}
  >
    {children}
  </button>
);

const Feature = ({ icon: Icon, title, text }) => (
  <div className="flex flex-col items-center text-center p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-sm hover:bg-white/10 transition-colors duration-500 group">
    <div className="p-4 rounded-full bg-white/5 group-hover:bg-yellow-600/20 transition-colors mb-6">
        <Icon className="text-yellow-500 group-hover:scale-110 transition-transform duration-500" size={32} strokeWidth={1.5} />
    </div>
    <h3 className="font-serif text-xl text-white mb-3 tracking-wide">{title}</h3>
    <p className="text-gray-400 font-light leading-relaxed text-sm">{text}</p>
  </div>
);

const ProductCard = ({ product }) => {
  // Calcul d'un prix barré fictif pour l'effet psychologique (+30% environ)
  const originalPrice = product.price * 1.3;

  return (
    <div className="group relative bg-[#141210] overflow-hidden cursor-pointer transition-all duration-500 border border-white/5 hover:border-yellow-600/30">
      {/* Badge FOMO */}
      <div className="absolute top-3 left-0 z-20 flex flex-col gap-2 items-start">
         <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest shadow-lg animate-pulse">
            Stock Faible
         </span>
         {product.category === "Signature" && (
             <span className="bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                Best Seller
             </span>
         )}
      </div>

      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
          onError={(e) => e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-transparent opacity-90"></div>
        
        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
             <Link 
            to={`/product/${product.id}`}
            className="flex items-center justify-center gap-2 w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-yellow-500 hover:text-white transition-colors"
          >
            <ShoppingBag size={14} /> Ajouter au panier
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 text-center relative z-10 -mt-12">
        <h3 className="font-serif text-xl text-white mb-2 group-hover:text-yellow-500 transition-colors">
          {product.name}
        </h3>
        
        {/* Prix avec ancre psychologique */}
        <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-gray-500 text-sm line-through decoration-red-500 decoration-1">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(originalPrice)}
            </span>
            <span className="font-bold text-yellow-500 text-xl">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
            </span>
        </div>
        
        {/* Avis */}
        <div className="flex items-center justify-center gap-1 mt-2">
            {[1,2,3,4,5].map(i => <Star key={i} size={10} className="fill-yellow-500 text-yellow-500"/>)}
            <span className="text-[10px] text-gray-400 uppercase tracking-wide ml-1">(48 avis)</span>
        </div>
      </div>
    </div>
  );
};

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
          // On garde les produits réels s'ils existent, sinon fallback
          if (data && data.length > 0) setProducts(data);
          else throw new Error("Empty DB");
        } else throw new Error("API Error");
      } catch (e) {
        // Fallback data optimisée pour la vente
        setProducts([
            {id: 1, name: "La Planche Titan™", price: 89.90, category: "Signature", image_url: "https://images.unsplash.com/photo-1628103598586-b4d216f40396?q=80&w=2000&auto=format&fit=crop"},
            {id: 2, name: "Couteau Chef Damas", price: 149.90, category: "Coutellerie", image_url: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800"},
            {id: 3, name: "Set Sommelier Or", price: 59.90, category: "Accessoires", image_url: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=800"},
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const featuredProduct = products.find(p => p.name && p.name.includes('Titan')) || products[0];

  return (
    <div className="bg-[#0c0a09] min-h-screen font-sans text-gray-200 selection:bg-yellow-600 selection:text-white">
      
      {/* BANDEAU URGENCE */}
      <div className="bg-gradient-to-r from-red-900 via-red-700 to-red-900 text-white text-[10px] font-black text-center py-2 px-4 tracking-[0.2em] uppercase flex justify-center items-center gap-3 border-b border-red-500/30">
        <Clock size={12} className="animate-pulse text-white"/>
        <span>Offre de lancement : -40% Jusqu'à minuit</span>
      </div>

      {/* 1. HERO SECTION (Promesse Forte) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.imgur.com/Vs7aq8I.jpeg" 
            alt="Dark Kitchen" 
            className="w-full h-full object-cover opacity-30 scale-105 animate-[pulse_15s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#0c0a09]"></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center mt-10">
          <div className="inline-block mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-center gap-2 border border-yellow-500/30 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-white ml-2">Élu Produit Cuisine 2025</span>
            </div>
          </div>
          
          <h1 className="font-serif text-5xl md:text-8xl text-white leading-[0.9] mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            L'HYGIÈNE ABSOLUE.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 italic">GARANTIE À VIE.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Jetez vos planches en plastique nids à bactéries.<br/>
            Passez au <strong className="text-white font-bold">Titane grade médical</strong>. Zéro rayure, zéro odeur, zéro compromis.
          </p>
          
          <div className="animate-in fade-in zoom-in duration-1000 delay-300 flex flex-col items-center gap-4">
             {featuredProduct && (
                 <Link to={`/product/${featuredProduct.id}`}>
                    <GoldButton>ACHETER MAINTENANT</GoldButton>
                 </Link>
             )}
             <div className="flex items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Truck size={12}/> Livraison Offerte</span>
                <span className="flex items-center gap-1"><ShieldCheck size={12}/> Satisfait ou Remboursé</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. LE PROBLÈME VS LA SOLUTION (Comparatif Choc) */}
      <section className="py-24 bg-[#0c0a09] relative overflow-hidden">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="font-serif text-3xl md:text-5xl text-white mb-6">Arrêtez de manger du plastique.</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">Une planche à découper classique accumule <strong>200% plus de bactéries</strong> que la cuvette de vos toilettes après 6 mois d'utilisation. Le Titane change tout.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Le Problème */}
                <div className="relative group rounded-2xl overflow-hidden border border-red-900/30">
                    <img src="https://images.unsplash.com/photo-1584269600464-370390753e3a?q=80&w=800" className="w-full h-80 object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" alt="Planche sale"/>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                        <XCircle size={64} className="text-red-600 mb-4 opacity-80" />
                        <h3 className="text-2xl font-bold text-red-500 mb-2">VOTRE PLANCHE ACTUELLE</h3>
                        <ul className="text-red-200/80 text-sm space-y-1 text-center font-medium">
                            <li>❌ Rayures profondes</li>
                            <li>❌ Nids à bactéries</li>
                            <li>❌ Microplastiques dans vos plats</li>
                            <li>❌ Odeurs tenaces</li>
                        </ul>
                    </div>
                </div>

                {/* La Solution */}
                <div className="relative group rounded-2xl overflow-hidden border border-green-900/30 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                    <img src="https://i.imgur.com/PiNTcwf.jpeg" className="w-full h-80 object-cover" alt="Planche Titane"/>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                        <CheckCircle size={64} className="text-green-500 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                        <h3 className="text-2xl font-bold text-white mb-2">LA PLANCHE TITAN™</h3>
                        <ul className="text-green-100 text-sm space-y-1 text-center font-bold tracking-wide">
                            <li>✅ Surface 100% Lisse</li>
                            <li>✅ Antibactérien Naturel</li>
                            <li>✅ Zéro Transfert Chimique</li>
                            <li>✅ Garantie à Vie</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 3. ARGUMENTAIRE D'AUTORITÉ */}
      <section className="py-24 border-t border-white/5 bg-[#141210]">
         <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="w-full md:w-1/2 relative">
                    <div className="aspect-[4/5] overflow-hidden rounded-sm border border-white/10 relative z-10">
                        <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop" alt="Chef" className="w-full h-full object-cover opacity-90"/>
                    </div>
                    {/* Citation flottante */}
                    <div className="absolute -bottom-6 -right-6 bg-[#0c0a09] border border-yellow-600/30 p-6 max-w-xs shadow-2xl z-20">
                        <p className="font-serif italic text-yellow-500 text-lg">"Enfin un outil qui respecte la noblesse des produits que je cuisine."</p>
                    </div>
                </div>
                
                <div className="w-full md:w-1/2 space-y-8">
                    <span className="text-yellow-600 font-bold tracking-[0.2em] text-xs uppercase flex items-center gap-2"><ChefHat size={16}/> Approuvé par les Pros</span>
                    <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                        L'exigence des étoilés,<br/>dans votre cuisine.
                    </h2>
                    <ul className="space-y-6">
                        {[
                            {title: "Précision Chirurgicale", text: "La dureté du titane permet une découpe nette sans abîmer le fil de vos couteaux japonais."},
                            {title: "Entretien Zéro", text: "Passe au lave-vaisselle. Ne rouille pas. Ne se tache pas. Un coup d'éponge et c'est neuf."},
                            {title: "Décongélation Rapide", text: "Le titane est un excellent conducteur thermique. Il décongèle vos aliments 3x plus vite naturellement."}
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="mt-1 w-6 h-6 rounded-full bg-yellow-600/20 flex items-center justify-center text-yellow-500 text-xs font-bold">{i+1}</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-4">
                         {featuredProduct && (
                            <Link to={`/product/${featuredProduct.id}`}>
                                <button className="text-white border-b border-white pb-1 hover:text-yellow-500 hover:border-yellow-500 transition-all text-sm uppercase tracking-widest font-bold">
                                    Voir la démonstration
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* 4. LE CATALOGUE (Offre Limitée) */}
      <section id="shop" className="py-32 bg-[#0c0a09]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-red-500 font-black tracking-widest uppercase text-xs mb-4 animate-pulse">● Stock Limitée</span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Nos Offres Exclusives</h2>
            <p className="text-gray-400 max-w-lg">Profitez des prix de lancement avant la rupture de stock définitive.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-[500px] bg-white/5 animate-pulse"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;