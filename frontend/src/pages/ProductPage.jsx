import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, ShoppingBag, Truck, ShieldCheck, ChevronDown, 
  ArrowLeft, Share2, Heart, Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Configuration API
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

// --- COMPOSANTS UI ---

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full py-4 flex justify-between items-center text-left hover:text-blue-600 transition-colors"
      >
        <span className="font-bold text-sm uppercase tracking-wide">{title}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        <div className="text-sm text-gray-500 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error("Produit introuvable");
        const data = await res.json();
        setProduct(data);

        // Fetch related (simulation: on prend tout et on filtre)
        const resAll = await fetch(`${API_URL}/products`);
        if (resAll.ok) {
          const all = await resAll.json();
          setRelatedProducts(all.filter(p => p.id !== parseInt(id)).slice(0, 3));
        }
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger le produit");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    // Ici vous connecterez votre CartContext
    toast.success(`${quantity}x ${product.name} ajouté au panier`, {
        icon: '🛍️',
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-20">Produit introuvable.</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 pb-20">
      
      {/* HEADER SIMPLE */}
      <div className="container mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Retour
        </Link>
        <div className="flex gap-4">
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Share2 size={18} /></button>
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Heart size={18} /></button>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* GAUCHE : VISUELS (Sticky sur Desktop) */}
            <div className="relative">
                <div className="lg:sticky lg:top-10 space-y-4">
                    {/* Image Principale */}
                    <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden relative group">
                        <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => e.target.src='https://via.placeholder.com/800'}
                        />
                        <div className="absolute top-4 left-4">
                            <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {product.category}
                            </span>
                        </div>
                    </div>
                    
                    {/* Galerie (Simulée pour l'effet visuel) */}
                    <div className="grid grid-cols-4 gap-4">
                        {[0, 1, 2, 3].map((i) => (
                            <button 
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <img src={product.image_url} className="w-full h-full object-cover opacity-80 hover:opacity-100" alt="" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* DROITE : INFOS & ACHAT */}
            <div className="lg:py-10">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center text-yellow-400 gap-1">
                            <Star size={18} fill="currentColor" />
                            <Star size={18} fill="currentColor" />
                            <Star size={18} fill="currentColor" />
                            <Star size={18} fill="currentColor" />
                            <Star size={18} fill="currentColor" className="opacity-50" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium underline cursor-pointer">4.8/5 (124 avis)</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-6">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        {product.description || "Un design exceptionnel pour une expérience unique. Fabriqué avec des matériaux premium pour durer dans le temps."}
                    </p>
                </div>

                {/* Sélecteurs (Couleur/Taille - Simulés) */}
                <div className="space-y-6 mb-8 border-t border-b border-gray-100 py-8">
                    {/* Actions d'achat */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center border border-gray-300 rounded-full px-4 h-14 w-full sm:w-32">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-500 hover:text-black font-bold text-xl px-2">-</button>
                            <span className="flex-1 text-center font-bold">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="text-gray-500 hover:text-black font-bold text-xl px-2">+</button>
                        </div>
                        <button 
                            onClick={handleAddToCart}
                            className="flex-1 bg-black text-white h-14 rounded-full font-bold text-lg hover:bg-gray-900 transition-all transform hover:scale-[1.02] shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={20} /> Ajouter au panier
                        </button>
                    </div>
                    
                    {/* Réassurance Rapide */}
                    <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1"><Truck size={14}/> Livraison Gratuite</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={14}/> Garantie 2 ans</span>
                        <span className="flex items-center gap-1"><Check size={14}/> En Stock</span>
                    </div>
                </div>

                {/* Accordéons */}
                <div className="space-y-2">
                    <Accordion title="Caractéristiques" defaultOpen={true}>
                        <ul className="list-disc pl-5 space-y-1 marker:text-gray-300">
                            <li>Matériaux premium certifiés</li>
                            <li>Design ergonomique et léger</li>
                            <li>Résistance à l'eau et à la poussière</li>
                            <li>Garantie constructeur incluse</li>
                        </ul>
                    </Accordion>
                    <Accordion title="Livraison & Retours">
                        <p>Livraison standard offerte (2-4 jours ouvrables). Livraison express disponible.</p>
                        <p className="mt-2">Retours gratuits sous 30 jours si le produit ne vous convient pas. Remboursement intégral sans question.</p>
                    </Accordion>
                    <Accordion title="Entretien">
                        <p>Nettoyer avec un chiffon doux et sec. Éviter l'exposition prolongée au soleil direct.</p>
                    </Accordion>
                </div>
            </div>
        </div>

        {/* SECTION : VOUS AIMEREZ AUSSI */}
        {relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-gray-100 pt-16">
                <h2 className="text-2xl font-bold mb-10 text-center">Vous aimerez aussi</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedProducts.map((rel) => (
                        <Link to={`/product/${rel.id}`} key={rel.id} className="group cursor-pointer">
                            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                                <img src={rel.image_url} alt={rel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => e.target.src='https://via.placeholder.com/400'}/>
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                    Voir le produit
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{rel.name}</h3>
                            <p className="text-gray-500">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(rel.price)}</p>
                        </Link>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProductPage;