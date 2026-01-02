import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Correction : Retrait des extensions pour la résolution standard
import { useTracking } from '../hooks/useTracking';
import { Search, X, Truck, ShieldCheck, Clock, Star, ArrowRight, Quote } from 'lucide-react';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

// Gestion sécurisée de l'URL API
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const navigate = useNavigate();
  const { trackEvent } = useTracking();
  const hasTracked = useRef(false);

  const categories = ["Tout", "Smartphone", "Ordinateur", "Audio", "Wearable", "Lifestyle"];

  const fallbackProducts = [
    {id: 1, name: "iPhone 15 Pro", price: 1299, category: "Smartphone", image_url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500"},
    {id: 2, name: "MacBook Air", price: 1499, category: "Ordinateur", image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=500"},
    {id: 3, name: "Sony Headphones", price: 349, category: "Audio", image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500"},
  ];

  const fetchProducts = () => {
    let url = `${API_URL}/products?`;
    if (searchTerm) url += `q=${searchTerm}&`;
    if (selectedCategory && selectedCategory !== "Tout") url += `category=${selectedCategory}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setProducts(data);
        } else {
            console.warn("API a renvoyé un format inattendu:", data);
            setProducts(fallbackProducts);
        }
      })
      .catch((err) => {
          console.error("Erreur réseau:", err);
          setProducts(fallbackProducts);
      });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
      if (searchTerm.length > 2) trackEvent('search', { term: searchTerm });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (!hasTracked.current) {
        trackEvent('page_view', { page: 'home' });
        hasTracked.current = true;
    }
  }, [trackEvent]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
       
       <Hero />

       <div className="max-w-7xl mx-auto px-4 py-12">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Truck size={24} /></div>
                {/* Correction de la syntaxe > */}
                <div><h3 className="font-bold text-slate-900">Livraison Gratuite</h3><p className="text-sm text-slate-500">Pour toute commande {'>'} 50€</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="bg-green-50 p-3 rounded-full text-green-600"><ShieldCheck size={24} /></div>
                <div><h3 className="font-bold text-slate-900">Garantie 2 Ans</h3><p className="text-sm text-slate-500">Certifié constructeur</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="bg-purple-50 p-3 rounded-full text-purple-600"><Clock size={24} /></div>
                <div><h3 className="font-bold text-slate-900">Support 24/7</h3><p className="text-sm text-slate-500">Une équipe à votre écoute</p></div>
            </div>
         </div>
       </div>

       <div id="collection" className="max-w-7xl mx-auto px-4 py-12">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Nos Produits</h2>
                <p className="text-slate-500">Les meilleures ventes du moment.</p>
            </div>

            <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all hover:border-blue-300"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 transform scale-105' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {!Array.isArray(products) || products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400">Aucun produit trouvé.</p>
                  <button onClick={() => {setSearchTerm(''); setSelectedCategory('Tout');}} className="mt-4 text-blue-600 font-medium hover:underline">Voir tout le catalogue</button>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                <div 
                    key={product.id} 
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
                >
                    <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden p-6 flex items-center justify-center">
                        <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="object-contain h-full w-full group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" 
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-slate-900 shadow-sm">
                            Nouveau
                        </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                        <div className="text-xs font-bold text-blue-600 uppercase mb-1 tracking-wider">{product.category}</div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1 leading-snug group-hover:text-blue-700 transition-colors">
                            {product.name}
                        </h3>
                        
                        <div className="flex items-center gap-1 mb-4">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                            <span className="text-xs text-slate-400 ml-1">(42)</span>
                        </div>

                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
                            <span className="text-xl font-bold text-slate-900">{product.price} €</span>
                            <span className="bg-slate-900 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <ArrowRight size={16} />
                            </span>
                        </div>
                    </div>
                </div>
                ))}
              </div>
          )}
       </div>

       {/* SECTION OFFRE SPÉCIALE */}
       <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             
             <div className="md:w-1/2 relative min-h-[300px] md:min-h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2000&auto=format&fit=crop" 
                  alt="Offre Spéciale" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent md:bg-gradient-to-r"></div>
             </div>

             <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center relative z-10 text-white">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-widest w-fit mb-6">
                   Offre Limitée
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                   Passez au niveau supérieur.
                </h2>
                <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-md">
                   Profitez de <span className="text-white font-bold">-20%</span> sur notre pack "Productivité Ultime" comprenant un clavier mécanique et une souris ergonomique.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                      En profiter maintenant
                   </button>
                   <button className="px-8 py-4 rounded-xl font-bold text-lg text-white border border-slate-700 hover:bg-slate-800 transition-all">
                      Voir les détails
                   </button>
                </div>
             </div>
          </div>
       </div>

       {/* SECTION TÉMOIGNAGES */}
       <div className="bg-white py-24 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Ils nous font confiance</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Rejoignez plus de 10 000 clients satisfaits qui ont choisi la qualité E-Shop.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-50 p-8 rounded-2xl relative">
                   <Quote className="absolute top-6 right-6 text-blue-100 w-12 h-12 rotate-180" />
                   <div className="flex items-center gap-1 mb-6">
                      {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                   </div>
                   <p className="text-slate-700 text-lg mb-6 leading-relaxed italic">
                      "Livraison incroyablement rapide ! J'ai reçu mon casque en moins de 24h. La qualité est au rendez-vous, je recommande vivement."
                   </p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">AL</div>
                      <div>
                         <h4 className="font-bold text-slate-900">Alexandre L.</h4>
                         <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Client Vérifié</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-2xl relative">
                   <Quote className="absolute top-6 right-6 text-blue-100 w-12 h-12 rotate-180" />
                   <div className="flex items-center gap-1 mb-6">
                      {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                   </div>
                   <p className="text-slate-700 text-lg mb-6 leading-relaxed italic">
                      "Le service client est top. J'avais une question sur la compatibilité et j'ai eu une réponse en 5 minutes. Très pro."
                   </p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">JD</div>
                      <div>
                         <h4 className="font-bold text-slate-900">Julie D.</h4>
                         <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Client Vérifié</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-2xl relative">
                   <Quote className="absolute top-6 right-6 text-blue-100 w-12 h-12 rotate-180" />
                   <div className="flex items-center gap-1 mb-6">
                      {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                   </div>
                   <p className="text-slate-700 text-lg mb-6 leading-relaxed italic">
                      "Enfin un site tech qui propose des produits de qualité avec un vrai design. Mon setup n'a jamais été aussi beau."
                   </p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">TM</div>
                      <div>
                         <h4 className="font-bold text-slate-900">Thomas M.</h4>
                         <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Client Vérifié</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <Footer />
    </div>
  );
};

export default HomePage;