import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingCart, ShieldCheck, Truck, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTracking } from '../hooks/useTracking';
import { Helmet } from 'react-helmet-async'; // <--- IMPORT SEO

let apiUrl = "http://localhost:8000/api/v1";
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { trackEvent } = useTracking();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const fallbackProduct = {
    id: id,
    name: "Produit Demo",
    price: 99.99,
    category: "Mode Démo",
    description: "Ceci est une description de test.",
    image_url: "https://via.placeholder.com/500"
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/products/${id}`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error("Erreur");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        trackEvent('view_item', { 
            product_id: data.id, 
            name: data.name,
            category: data.category
        });
        return fetch(`${API_URL}/products?category=${data.category}`);
      })
      .then(res => res ? res.json() : [])
      .then(allProducts => {
        if (Array.isArray(allProducts)) {
            const related = allProducts
                .filter(p => p.id !== parseInt(id))
                .slice(0, 3);
            setRelatedProducts(related);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setProduct(fallbackProduct);
      });

    return () => controller.abort();
  }, [id, trackEvent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* SEO DYNAMIQUE : Le titre change selon le produit ! */}
      <Helmet>
        <title>{product.name} | E-Shop Empire</title>
        <meta name="description" content={`Achetez ${product.name} au meilleur prix. ${product.description}`} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.image_url} />
        <meta property="og:price:amount" content={product.price} />
        <meta property="og:price:currency" content="EUR" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="group flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <div className="bg-gray-100 p-2 rounded-full mr-3 group-hover:bg-blue-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Retour au catalogue</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex items-center justify-center aspect-square shadow-inner relative group overflow-hidden">
             <img src={product.image_url} alt={product.name} className="object-contain w-full h-full drop-shadow-xl group-hover:scale-105 transition-transform duration-500 z-10" />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>

          <div className="flex flex-col h-full pt-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">{product.category}</span>
                <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" className="text-gray-300" />
                    <span className="text-xs text-gray-400 font-medium ml-1 text-black">(24 avis)</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">{product.name}</h1>
              <p className="text-gray-500 text-lg leading-relaxed">{product.description}</p>
            </div>
            
            <div className="mt-auto border-t border-gray-100 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                 <div>
                   <p className="text-sm text-gray-400 mb-1">Prix total</p>
                   <span className="text-4xl font-bold text-slate-900">{product.price} €</span>
                 </div>
                 <button
                   onClick={() => { 
                       addToCart(product); 
                       trackEvent('add_to_cart', { 
                           id: product.id, 
                           name: product.name, 
                           price: product.price,
                           category: product.category
                       }); 
                   }}
                   className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                   <ShoppingCart size={24} /> Ajouter au panier
                 </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100"><Check className="text-green-500 mr-2" size={20} /> En stock</div>
                 <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100"><Truck className="text-blue-500 mr-2" size={20} /> Livraison 24h</div>
                 <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100"><ShieldCheck className="text-purple-500 mr-2" size={20} /> Garantie 2 ans</div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
            <div className="border-t border-gray-100 pt-16">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Vous aimerez aussi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {relatedProducts.map((related) => (
                        <div 
                            key={related.id}
                            onClick={() => navigate(`/product/${related.id}`)}
                            className="group cursor-pointer bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all overflow-hidden"
                        >
                            <div className="h-48 bg-gray-50 p-6 flex items-center justify-center">
                                <img src={related.image_url} alt={related.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-300 mix-blend-multiply" />
                            </div>
                            <div className="p-4">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">{related.category}</p>
                                <h3 className="font-bold text-slate-900 mb-2 truncate">{related.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900">{related.price} €</span>
                                    <span className="text-sm text-blue-600 font-medium group-hover:underline">Voir</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProductPage;