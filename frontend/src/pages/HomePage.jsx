import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTracking } from '../hooks/useTracking';
import { Search, Filter, X } from 'lucide-react'; // Nouvelles icônes

const API_URL = "http://localhost:8000/api/v1";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État recherche
  const [selectedCategory, setSelectedCategory] = useState("Tout"); // État catégorie
  const navigate = useNavigate();
  const { trackEvent } = useTracking();
  const hasTracked = useRef(false);

  const categories = ["Tout", "Smartphone", "Ordinateur", "Audio", "Wearable", "Lifestyle"];

  const fallbackProducts = [
    {id: 1, name: "Smartphone Demo", price: 999, category: "Tech", image_url: "https://via.placeholder.com/300"},
    {id: 2, name: "Laptop Demo", price: 1299, category: "Tech", image_url: "https://via.placeholder.com/300"},
  ];

  // Fonction pour charger les produits avec filtres
  const fetchProducts = () => {
    // Construction de l'URL avec paramètres (ex: ?q=mac&category=Ordinateur)
    let url = `${API_URL}/products?`;
    if (searchTerm) url += `q=${searchTerm}&`;
    if (selectedCategory && selectedCategory !== "Tout") url += `category=${selectedCategory}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data) setProducts(data);
        else setProducts(fallbackProducts);
      })
      .catch(() => setProducts(fallbackProducts));
  };

  // On recharge quand la recherche ou la catégorie change
  useEffect(() => {
    // Debounce (attendre que l'utilisateur finisse de taper) pour éviter trop d'appels
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
      // Tracking de la recherche si elle n'est pas vide
      if (searchTerm.length > 2) {
          trackEvent('search', { term: searchTerm, category: selectedCategory });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory]);

  // Tracking initial page view
  useEffect(() => {
    if (!hasTracked.current) {
        trackEvent('page_view', { page: 'home' });
        hasTracked.current = true;
    }
  }, [trackEvent]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
       
       {/* HEADER & RECHERCHE */}
       <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2 mb-6">La Collection</h1>
          
          {/* Barre de Recherche */}
          <div className="max-w-md mx-auto relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
              placeholder="Rechercher un produit (ex: iPhone, Sony...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <X size={16} />
                </button>
            )}
          </div>

          {/* Filtres Catégories (Pillules) */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
       </div>

       {/* GRILLE PRODUITS */}
       {products.length === 0 ? (
           <div className="text-center py-20 text-gray-500">
               <p className="text-lg">Aucun produit ne correspond à votre recherche.</p>
               <button onClick={() => {setSearchTerm(''); setSelectedCategory('Tout');}} className="mt-4 text-blue-600 hover:underline">Réinitialiser les filtres</button>
           </div>
       ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="h-64 bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
                   <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors z-10" />
                   <img src={product.image_url} alt={product.name} className="object-contain h-full w-full group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                   <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-wide">{product.category}</p>
                   <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight group-hover:text-blue-700 transition-colors">{product.name}</h3>
                   <div className="mt-auto flex justify-between items-end pt-4">
                     <span className="text-2xl font-bold text-gray-900">{product.price} €</span>
                     <span className="text-sm font-medium text-gray-400 group-hover:translate-x-1 transition-transform flex items-center">Voir <span className="ml-1">→</span></span>
                   </div>
                </div>
              </div>
            ))}
           </div>
       )}
    </div>
  );
};

export default HomePage;