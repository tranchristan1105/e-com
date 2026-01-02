import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracking } from '../hooks/useTracking';
import { Search, X, Truck, ShieldCheck, Clock, Star, ArrowRight, Quote } from 'lucide-react';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import SkeletonProduct from '../components/SkeletonProduct';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async'; // <--- IMPORT SEO

let apiUrl = "http://localhost:8000/api/v1";
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    let url = `${API_URL}/products?`;
    if (searchTerm) url += `q=${searchTerm}&`;
    if (selectedCategory && selectedCategory !== "Tout") url += `category=${selectedCategory}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
            if (Array.isArray(data)) setProducts(data);
            else setProducts(fallbackProducts);
            setLoading(false);
        }, 600);
      })
      .catch(() => {
          setProducts(fallbackProducts);
          setLoading(false);
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
    <div className="bg-slate-50 min-h-screen font-sans selection:bg-blue-200">
       
       {/* CONFIGURATION SEO POUR LA PAGE D'ACCUEIL */}
       <Helmet>
         <title>E-Shop Empire | Le Meilleur de la Tech Premium</title>
         <meta name="description" content="Découvrez notre sélection exclusive de smartphones, ordinateurs et accessoires audio. Livraison gratuite et garantie 2 ans." />
       </Helmet>

       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
         <Hero />
       </motion.div>

       <div className="max-w-7xl mx-auto px-4 py-16">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { icon: Truck, title: "Livraison Offerte", text: "Commande > 50€", color: "blue" },
                { icon: ShieldCheck, title: "Garantie Premium", text: "2 ans inclus", color: "green" },
                { icon: Clock, title: "Support VIP", text: "Réponse < 1h", color: "purple" }
            ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`bg-${item.color}-50 p-3 rounded-full text-${item.color}-600`}>
                        <item.icon size={24} />
                    </div>
                    <div><h3 className="font-bold text-slate-900">{item.title}</h3><p className="text-sm text-slate-500">{item.text}</p></div>
                </div>
            ))}
         </div>
       </div>

       <div id="collection" className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">La Collection</h2>
                <p className="text-slate-500 text-lg">L'excellence technologique, sélectionnée pour vous.</p>
            </div>
            <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" /></div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all hover:border-slate-300"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 transform scale-105' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => <SkeletonProduct key={i} />)}
              </div>
          ) : (
              products.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400">Aucun produit trouvé.</p>
                      <button onClick={() => {setSearchTerm(''); setSelectedCategory('Tout');}} className="mt-4 text-blue-600 font-medium hover:underline">Voir tout le catalogue</button>
                  </div>
              ) : (
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    key={selectedCategory + searchTerm}
                  >
                    {products.map((product) => (
                      <motion.div 
                        key={product.id} 
                        variants={itemVariants}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="group bg-white rounded-[1.5rem] border border-slate-100 hover:border-blue-100/50 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden cursor-pointer flex flex-col h-full relative"
                      >
                        <div className="aspect-[4/3] bg-slate-50/50 p-8 flex items-center justify-center relative overflow-hidden">
                            <motion.img 
                                whileHover={{ scale: 1.1, rotate: -2 }}
                                transition={{ duration: 0.4 }}
                                src={product.image_url} 
                                alt={product.name} 
                                className="object-contain h-full w-full mix-blend-multiply relative z-10" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-4 left-4">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1">
                            <div className="text-[10px] font-bold text-blue-600 uppercase mb-2 tracking-widest">{product.category}</div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1 leading-snug group-hover:text-blue-600 transition-colors">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-4">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                                <span className="text-xs text-slate-400 ml-1 font-medium">(4.9)</span>
                            </div>
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
                                <span className="text-xl font-bold text-slate-900">{product.price} €</span>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    className="bg-slate-900 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                                >
                                    <ArrowRight size={18} />
                                </motion.button>
                            </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
              )
          )}
       </div>

       <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="md:w-1/2 relative min-h-[300px] md:min-h-[500px]">
                <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2000&auto=format&fit=crop" alt="Offre" className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent md:bg-gradient-to-r"></div>
             </div>
             <div className="md:w-1/2 p-12 md:p-20 flex flex-col justify-center relative z-10 text-white">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-widest w-fit mb-6">Offre Limitée</span>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Passez au niveau supérieur.</h2>
                <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-md">Profitez de <span className="text-white font-bold">-20%</span> sur notre pack "Productivité Ultime".</p>
                <div className="flex flex-col sm:flex-row gap-4">
                   <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all">En profiter</button>
                </div>
             </div>
          </div>
       </div>

       <div className="bg-white py-24 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Ils nous font confiance</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Rejoignez plus de 10 000 clients satisfaits.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-2xl relative">
                       <Quote className="absolute top-6 right-6 text-blue-100 w-12 h-12 rotate-180" />
                       <div className="flex items-center gap-1 mb-6"><Star size={16} className="fill-yellow-400 text-yellow-400" /></div>
                       <p className="text-slate-700 text-lg mb-6 leading-relaxed italic">"Service impeccable et produits de haute qualité. Je recommande !"</p>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">Client</div>
                          <div><h4 className="font-bold text-slate-900">Utilisateur Vérifié</h4></div>
                       </div>
                    </div>
                ))}
             </div>
          </div>
       </div>

       <Footer />
    </div>
  );
};

export default HomePage;