import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTracking } from '../hooks/useTracking';

// --- CORRECTION ICI ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { trackEvent } = useTracking();
  const [product, setProduct] = useState(null);

  const fallbackProduct = {
    id: id,
    name: "Produit Demo (Offline)",
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
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setProduct(fallbackProduct);
      });

    return () => controller.abort();
  }, [id, trackEvent]);

  if (!product) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="group flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
        <div className="bg-gray-100 p-2 rounded-full mr-3 group-hover:bg-blue-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium">Retour au catalogue</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex items-center justify-center aspect-square shadow-inner">
           <img src={product.image_url} alt={product.name} className="object-contain w-full h-full drop-shadow-xl hover:scale-105 transition-transform duration-500" />
        </div>

        <div className="flex flex-col h-full pt-4">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-4">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">{product.name}</h1>
            <p className="text-gray-500 text-lg leading-relaxed">{product.description}</p>
          </div>
          
          <div className="mt-auto border-t border-gray-100 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
               <div>
                 <p className="text-sm text-gray-400 mb-1">Prix total</p>
                 <span className="text-4xl font-bold text-gray-900">{product.price} €</span>
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
                 className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
               >
                 <ShoppingCart size={24} /> Ajouter au panier
               </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg"><Check className="text-green-500 mr-2" size={20} /> En stock</div>
               <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg"><Truck className="text-blue-500 mr-2" size={20} /> Livraison 24h</div>
               <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg"><ShieldCheck className="text-purple-500 mr-2" size={20} /> Garantie 2 ans</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;