import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, Zap, 
  Utensils, ChefHat, Sparkles, MoveRight
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
    className={`bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-serif font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-sm hover:from-yellow-500 hover:to-yellow-600 transition-all duration-500 shadow-[0_10px_30px_rgba(234,179,8,0.2)] hover:shadow-[0_10px_40px_rgba(234,179,8,0.4)] ${className}`}
  >
    {children}
  </button>
);

const Feature = ({ icon: Icon, title, text }) => (
  <div className="flex flex-col items-center text-center p-8 border border-white/5 bg-white/5 backdrop-blur-sm rounded-none hover:bg-white/10 transition-colors duration-500">
    <Icon className="text-yellow-600 mb-6" size={32} strokeWidth={1} />
    <h3 className="font-serif text-xl text-white mb-3 tracking-wide">{title}</h3>
    <p className="text-gray-400 font-light leading-relaxed text-sm">{text}</p>
  </div>
);

const ProductCard = ({ product }) => {
  return (
    <div className="group relative bg-[#1c1917] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2">
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden relative">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
          onError={(e) => e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
        
        {/* Quick Add (Style minimaliste) */}
        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
             <Link 
            to={`/product/${product.id}`}
            className="block w-full bg-white text-black text-center py-4 font-bold uppercase tracking-widest text-xs hover:bg-yellow-600 hover:text-white transition-colors"
          >
            Découvrir la pièce
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 text-center border-t border-white/5">
        <h3 className="font-serif text-xl text-white mb-2 group-hover:text-yellow-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">{product.category}</p>
        <span className="font-light text-yellow-600 text-lg">
          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
        </span>
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
          setProducts(data);
        }
      } catch (e) {
        console.error("Erreur API", e);
        // Fallback data si API HS (Simulation de tes produits)
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

  // On essaie de trouver la planche Titan, sinon on prend le premier produit
  const featuredProduct = products.find(p => p.name.includes('Titan')) || products[0];

  return (
    <div className="bg-[#0c0a09] min-h-screen font-sans text-gray-200 selection:bg-yellow-600 selection:text-white">
      
      {/* 1. HERO SECTION (Ambiance Restaurant Étoilé) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Vidéo/Image Sombre */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop" 
            alt="Dark Kitchen" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-[pulse_15s_ease-in-out_infinite]"
          />
          {/* Vignettage fort pour focus centre */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#0c0a09]"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center mt-10">
          <div className="inline-block mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center justify-center gap-3 border-b border-yellow-600/50 pb-2">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold tracking-[0.3em] uppercase text-yellow-500 ml-2">L'Excellence Culinaire</span>
            </div>
          </div>
          
          <h1 className="font-serif text-5xl md:text-8xl text-white leading-tight mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            LA RÉVOLUTION <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 italic">TITANE.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Fini le plastique. Oubliez le bois. <br/>
            Découvrez la surface de découpe éternelle, antibactérienne et indestructible adoptée par les chefs.
          </p>
          
          <div className="animate-in fade-in zoom-in duration-1000 delay-300">
             {featuredProduct && (
                 <Link to={`/product/${featuredProduct.id}`}>
                    <GoldButton>Commander la Pièce Maîtresse</GoldButton>
                 </Link>
             )}
             <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest">Série Limitée • Expédition 24h</p>
          </div>
        </div>
      </section>

      {/* 2. ARGUMENTAIRE "CHEF" (Preuve d'autorité) */}
      <section className="py-24 bg-[#0c0a09] relative">
         <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                    <div className="aspect-[3/4] overflow-hidden rounded-sm border border-white/10 relative z-10">
                        <img 
                            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000&auto=format&fit=crop" 
                            alt="Chef cutting" 
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                    {/* Cadre décoratif */}
                    <div className="absolute top-8 -right-8 w-full h-full border border-yellow-600/30 -z-0 hidden md:block"></div>
                </div>
                
                <div className="space-y-8">
                    <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                        "L'outil qui manquait <br/><span className="text-yellow-600 italic">à ma cuisine.</span>"
                    </h2>
                    <p className="text-gray-400 leading-loose text-lg font-light">
                        Dans une cuisine étoilée, l'hygiène est non-négociable. Les planches classiques gardent les odeurs et les bactéries. Le Titane est pur. Il ne s'altère jamais. C'est la toile vierge parfaite pour sublimer des produits d'exception.
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <div className="w-12 h-12 bg-gray-800 rounded-full overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200" alt="Chef" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                            <p className="text-white font-bold uppercase tracking-wider text-sm">Marc Veyrat (Fictif)</p>
                            <p className="text-yellow-600 text-xs">Chef Étoilé</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* 3. LES 3 PILIERS (Features) */}
      <section className="py-24 border-y border-white/5 bg-[#141210]">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
               <span className="text-yellow-600 text-xs font-bold uppercase tracking-[0.3em]">Ingénierie Culinaire</span>
               <h2 className="font-serif text-3xl md:text-4xl text-white mt-4">Pourquoi le Titane ?</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
              <Feature 
                icon={ShieldCheck} 
                title="Hygiène Absolue" 
                text="Matériau non-poreux de grade médical. Aucune bactérie ne peut survivre. Aucune odeur ne persiste. Un simple rinçage suffit."
              />
              <Feature 
                icon={Sparkles} 
                title="Inaltérable" 
                text="Ne se raye pas profondément. Ne se déforme jamais. Ne craint ni la chaleur, ni l'acide, ni le temps. Un achat pour la vie."
              />
              <Feature 
                icon={Utensils} 
                title="Respect du Produit" 
                text="Sa surface froide maintient la température de vos viandes et poissons lors de la découpe pour une texture préservée."
              />
           </div>
        </div>
      </section>

      {/* 4. LE MENU (Catalogue) */}
      <section id="shop" className="py-32 bg-[#0c0a09]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl text-white">La Collection</h2>
              <div className="h-1 w-20 bg-yellow-600 mt-4"></div>
            </div>
            <Link to="#" className="hidden md:flex items-center text-gray-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest mt-6 md:mt-0 group">
              Voir tout le catalogue <MoveRight className="ml-2 group-hover:translate-x-2 transition-transform" size={16} />
            </Link>
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

      {/* 5. FOOTER LUXE */}
      <footer className="bg-black text-gray-500 py-20 border-t border-white/10">
        <div className="container mx-auto px-6 flex flex-col items-center text-center">
            <h2 className="font-black text-3xl tracking-[0.5em] text-white mb-8">EMPIRE.</h2>
            
            <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-widest mb-12">
                <Link to="/legal" className="hover:text-yellow-500 transition-colors">Mentions Légales</Link>
                <Link to="/shipping" className="hover:text-yellow-500 transition-colors">Livraison & Retours</Link>
                <Link to="/privacy" className="hover:text-yellow-500 transition-colors">Confidentialité</Link>
                <Link to="/dashboard" className="text-white/30 hover:text-white transition-colors">Accès Privé</Link>
            </div>
            
            <div className="max-w-md text-sm leading-relaxed mb-12 font-light">
                "La cuisine est un art qui ne souffre pas la médiocrité. <br/>Équipez-vous en conséquence."
            </div>

            <p className="text-[10px] uppercase tracking-widest opacity-40">© 2025 Empire Inc. Paris • New York • Tokyo</p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;