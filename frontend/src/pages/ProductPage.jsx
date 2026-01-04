import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, ShoppingBag, Truck, ShieldCheck, ChevronDown, 
  ArrowLeft, Share2, Heart, Check, Plus, Minus, RefreshCw, AlertTriangle, ArrowRight, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import du contexte panier activé
import { useCart } from '../context/CartContext';

// --- CONFIGURATION API ---
// Logique dynamique : Localhost par défaut, ou variable d'environnement pour la Prod
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

// --- UTILS ---
const formatPrice = (price) => {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(price) || 0);
  } catch (e) {
    return "0,00 €";
  }
};

// --- COMPOSANTS UI TECH/LUXE ---

const TechSpec = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all duration-300">
    <Icon className="text-black mb-2" size={24} strokeWidth={1.5} />
    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-semibold text-gray-900 mt-1">{value}</span>
  </div>
);

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200 py-4 first:border-t-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left group"
      >
        <span className="font-bold text-lg text-gray-900 group-hover:text-gray-600 transition-colors">{title}</span>
        <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="text-gray-600 leading-relaxed text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  
  // Utilisation réelle du contexte panier
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M'); // Simulation taille

  useEffect(() => {
    // Force le scroll en haut de page à l'arrivée sur la fiche produit
    window.scrollTo(0, 0);

    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`${API_URL}/products/${id}`).catch(() => null);
        
        if (res && res.ok) {
          const data = await res.json();
          setProduct(data);
          
          const resAll = await fetch(`${API_URL}/products`).catch(() => null);
          if (resAll && resAll.ok) {
            const all = await resAll.json();
            if (Array.isArray(all)) setRelatedProducts(all.filter(p => p.id !== parseInt(id)).slice(0, 3));
          }
        } else {
          throw new Error("Produit introuvable ou API éteinte");
        }
      } catch (e) {
        console.warn("Mode Fallback activé:", e);
        setProduct({
            id: 1,
            name: "Empire Edition Gold (Pro Max)",
            price: 1299.00,
            category: "Premium Tech",
            description: "Une ingénierie de précision pour une performance sans compromis. Le design rencontre la puissance brute dans un châssis en titane aérospatial.",
            image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200"
        });
        setRelatedProducts([
            {id: 99, name: "Audio Master", price: 349, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"},
            {id: 98, name: "Urban Runner", price: 199, image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"}
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white"><ShoppingBag size={18} /></div>
        <div>
          <p className="font-bold text-sm">Ajouté au panier</p>
          <p className="text-xs text-gray-500">{product.name}</p>
        </div>
      </div>, 
      {
        style: { borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' },
        duration: 3000
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <AlertTriangle size={48} className="mb-4 text-red-500" />
        <h2 className="text-2xl font-bold tracking-tight">Produit introuvable</h2>
        <Link to="/" className="mt-6 px-6 py-3 bg-black text-white rounded-full font-medium hover:scale-105 transition-transform">Retour à la boutique</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-black selection:bg-black selection:text-white">
      
      {/* HEADER FLOTTANT */}
      <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:opacity-60 transition-opacity">
                <ArrowLeft size={18} /> <span className="hidden sm:inline">Retour</span>
            </Link>
            <span className="font-bold text-lg tracking-tight hidden md:block">{product.name}</span>
            <div className="flex gap-4">
                <button className="hover:scale-110 transition-transform"><Share2 size={20} /></button>
                <button className="hover:scale-110 transition-transform"><Heart size={20} /></button>
            </div>
        </div>
      </nav>

      <div className="pt-16 max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row">
            
            {/* GAUCHE : GALERIE VERTICALE (IMMERSIVE) */}
            <div className="lg:w-7/12 xl:w-2/3 bg-gray-50 flex flex-col gap-4 p-4 lg:p-0">
                {/* Image Principale (Grande) */}
                <div className="w-full h-[60vh] lg:h-screen relative overflow-hidden group">
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => e.target.src='https://via.placeholder.com/1200x1600'}
                    />
                </div>
                {/* Images Secondaires (Simulées pour le style) */}
                <div className="grid grid-cols-2 gap-4 lg:hidden">
                     <img src={`https://source.unsplash.com/random/800x800?sig=${product.id+1}`} className="rounded-xl" alt="" />
                     <img src={`https://source.unsplash.com/random/800x800?sig=${product.id+2}`} className="rounded-xl" alt="" />
                </div>
            </div>

            {/* DROITE : DÉTAILS & ACHAT (STICKY) */}
            <div className="lg:w-5/12 xl:w-1/3 p-6 lg:p-12 xl:p-16 flex flex-col justify-center relative bg-white">
                <div className="lg:sticky lg:top-24 max-w-lg mx-auto w-full space-y-8">
                    
                    {/* Titre & Prix */}
                    <div className="space-y-4 border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">Nouveau</span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.category}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-gray-900">
                            {product.name}
                        </h1>
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-medium tracking-tight text-gray-900">{formatPrice(product.price)}</span>
                            <div className="flex items-center gap-1 text-sm font-medium">
                                <Star size={16} className="fill-black text-black" />
                                <span>4.9</span>
                                <span className="text-gray-400 underline ml-1 cursor-pointer">128 avis</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed font-medium">
                        {product.description || "L'excellence redéfinie. Conçu pour ceux qui exigent le meilleur de la technologie et du style."}
                    </p>

                    {/* Sélecteurs (Taille/Option) */}
                    <div className="space-y-4">
                        <span className="text-sm font-bold uppercase tracking-wider text-gray-900">Modèle</span>
                        <div className="grid grid-cols-3 gap-3">
                            {['Standard', 'Pro', 'Ultra'].map((size) => (
                                <button 
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`py-3 rounded-lg border-2 text-sm font-bold transition-all ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bouton d'Action (Gros CTA) */}
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 h-14 w-32 hover:border-black transition-colors">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 rounded"><Minus size={16}/></button>
                                <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 rounded"><Plus size={16}/></button>
                            </div>
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span>Ajouter</span> <ArrowRight size={20} />
                            </button>
                        </div>
                        <div className="flex justify-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-wide pt-2">
                            <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-500 fill-yellow-500" /> Expédition 24h</span>
                            <span className="flex items-center gap-1"><ShieldCheck size={14} /> Garantie 2 ans</span>
                        </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-4 py-6">
                        <TechSpec icon={ShieldCheck} label="Durabilité" value="Grade Militaire" />
                        <TechSpec icon={Truck} label="Livraison" value="Offerte > 100€" />
                        <TechSpec icon={RefreshCw} label="Retours" value="30 Jours" />
                        <TechSpec icon={Check} label="Stock" value="Disponible" />
                    </div>

                    {/* Accordéons */}
                    <div>
                        <Accordion title="Caractéristiques Techniques">
                            <ul className="list-disc list-inside space-y-1 marker:text-black">
                                <li>Processeur Neural Engine</li>
                                <li>Châssis en alliage premium</li>
                                <li>Résistance eau/poussière IP68</li>
                            </ul>
                        </Accordion>
                        <Accordion title="Contenu du coffret">
                            <p>1x {product.name}</p>
                            <p>1x Câble de charge haute vitesse</p>
                            <p>1x Guide de démarrage rapide</p>
                        </Accordion>
                    </div>

                </div>
            </div>
        </div>

        {/* CROSS SELL (Grille Moderne) */}
        {relatedProducts.length > 0 && (
            <div className="mt-32 pb-24 px-6 max-w-[1800px] mx-auto border-t border-gray-100 pt-24">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Cela pourrait vous plaire.</h2>
                    <Link to="/" className="hidden md:flex items-center font-bold text-sm border-b-2 border-black pb-1 hover:opacity-60 transition-opacity">
                        Tout voir
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedProducts.map((rel) => (
                        <Link to={`/product/${rel.id}`} key={rel.id} className="group block cursor-pointer">
                            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                                <img 
                                    src={rel.image_url} 
                                    alt={rel.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    onError={(e) => e.target.src='https://via.placeholder.com/600x400'}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                                <button className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{rel.name}</h3>
                                    <span className="text-sm text-gray-500">Edition Limitée</span>
                                </div>
                                <span className="font-bold text-lg">{formatPrice(rel.price)}</span>
                            </div>
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