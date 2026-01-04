import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, ShoppingBag, Truck, ShieldCheck, ChevronDown, 
  ArrowLeft, Share2, Heart, Check, Plus, Minus, RefreshCw, AlertTriangle, ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ⚠️ POUR VOTRE PROJET LOCAL : DÉCOMMENTEZ LA LIGNE CI-DESSOUS
import { useCart } from '../context/CartContext';

// --- CONFIGURATION API ---
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

// --- COMPOSANTS UI ---
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-200">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex justify-between items-center text-left hover:pl-2 transition-all">
        <span className="font-serif text-lg text-stone-900">{title}</span>
        <span className={`text-xl transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
        <div className="text-stone-600 font-light leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

const ColorSwatch = ({ color, active, onClick }) => (
  <button onClick={onClick} className={`w-10 h-10 rounded-full border p-1 transition-all ${active ? 'border-stone-900 scale-110' : 'border-stone-200 hover:border-stone-400'}`}>
    <div className={`w-full h-full rounded-full ${color}`}></div>
  </button>
);

const ProductPage = () => {
  const { id } = useParams();
  
  // ⚠️ POUR VOTRE PROJET LOCAL : DÉCOMMENTEZ LA LIGNE CI-DESSOUS
const { addToCart } = useCart();

  // 👇 FONCTION DE SECOURS (A supprimer ou commenter quand vous utilisez useCart)

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0); 
  const [activeColor, setActiveColor] = useState(0);

  useEffect(() => {
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
            name: "Empire Edition Gold (Démo)",
            price: 1299.00,
            category: "Luxe",
            description: "Produit de démonstration. L'API semble inaccessible, mais le design fonctionne.",
            image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
        });
        setRelatedProducts([
            {id: 99, name: "Item Démo 1", price: 349, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"},
            {id: 98, name: "Item Démo 2", price: 199, image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"}
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Appel de la fonction (réelle ou simulée selon vos commentaires)
    addToCart(product, quantity);

    toast.success(
      <div className="flex flex-col">
        <span className="font-serif font-bold text-stone-900">Ajouté au panier</span>
        <span className="text-xs text-stone-500 uppercase tracking-widest">{quantity}x {product.name}</span>
      </div>, 
      {
        icon: '👜',
        style: {
            borderRadius: '0px',
            background: '#fff',
            color: '#1c1917',
            border: '1px solid #e7e5e4',
            padding: '16px 24px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
        },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbf9] text-stone-400">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <span className="text-xs uppercase tracking-widest">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-4">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-xl font-bold">Erreur</h2>
        <p>{error}</p>
        <Link to="/" className="mt-4 underline">Retour</Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-[#fcfbf9] min-h-screen font-sans text-stone-900 pb-32">
      
      {/* HEADER FIXED */}
      <div className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
        <Link to="/" className="text-xs font-bold uppercase tracking-widest hover:opacity-70 pointer-events-auto flex items-center gap-2">
            <ArrowLeft size={14} /> Retour
        </Link>
        <div className="flex gap-6 pointer-events-auto">
            <button><Share2 size={20} /></button>
            <button><Heart size={20} /></button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-24 lg:pt-32">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
            
            {/* GAUCHE: IMAGE */}
            <div className="lg:w-1/2">
                <div className="lg:sticky lg:top-12 space-y-6">
                    <div className="aspect-[3/4] lg:aspect-[4/5] bg-stone-200 overflow-hidden relative shadow-2xl">
                        <img 
                            src={activeImage === 0 ? product.image_url : `https://source.unsplash.com/random/800x800?sig=${activeImage}`}
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src='https://via.placeholder.com/800x1000'}
                        />
                    </div>
                    {/* Galerie */}
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {[0, 1, 2].map((i) => (
                            <button key={i} onClick={() => setActiveImage(i)} className={`w-20 aspect-square overflow-hidden border ${activeImage === i ? 'border-stone-900' : 'border-transparent'}`}>
                                <img src={i === 0 ? product.image_url : `https://source.unsplash.com/random/200x200?sig=${i}`} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* DROITE: INFOS */}
            <div className="lg:w-1/2 lg:pt-12">
                <div className="mb-12 border-b border-stone-200 pb-12">
                    <h1 className="font-serif text-5xl text-stone-900 mb-6 leading-none">{product.name}</h1>
                    <div className="flex justify-between items-center">
                        <span className="text-3xl font-light">{formatPrice(product.price)}</span>
                        <div className="flex items-center gap-2">
                            <div className="flex text-stone-900">
                                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                            <span className="text-xs uppercase tracking-widest text-stone-500">Avis</span>
                        </div>
                    </div>
                </div>

                <p className="text-stone-600 leading-loose text-lg font-light mb-12">
                    {product.description || "Description de luxe non disponible."}
                </p>

                <div className="mb-12">
                    <span className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Finitions</span>
                    <div className="flex gap-4">
                        <ColorSwatch color="bg-stone-900" active={activeColor === 0} onClick={() => setActiveColor(0)} />
                        <ColorSwatch color="bg-[#d4cbb8]" active={activeColor === 1} onClick={() => setActiveColor(1)} />
                        <ColorSwatch color="bg-[#8b8076]" active={activeColor === 2} onClick={() => setActiveColor(2)} />
                    </div>
                </div>

                {/* BOUTON ACHAT */}
                <div className="flex gap-4 mb-12">
                    <div className="flex items-center border border-stone-300 px-4 h-16 w-32">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2"><Minus size={16}/></button>
                        <span className="flex-1 text-center font-serif text-xl">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2"><Plus size={16}/></button>
                    </div>
                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-stone-900 text-white h-16 px-8 hover:bg-black transition-all flex items-center justify-between group"
                    >
                        <span className="font-bold uppercase tracking-widest text-xs">Ajouter au panier</span>
                        <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 py-8 border-t border-stone-200 text-xs uppercase tracking-widest text-stone-500">
                    <div className="flex flex-col items-center gap-2"><Truck size={20} /><span>Livraison</span></div>
                    <div className="flex flex-col items-center gap-2"><ShieldCheck size={20} /><span>Garantie</span></div>
                    <div className="flex flex-col items-center gap-2"><Check size={20} /><span>Authentique</span></div>
                </div>

                <div className="mt-8 space-y-2">
                    <Accordion title="Détails" defaultOpen><p>Matériaux premium.</p></Accordion>
                    <Accordion title="Livraison"><p>Expédition sous 24h.</p></Accordion>
                </div>
            </div>
        </div>

        {/* CROSS SELL */}
        {relatedProducts.length > 0 && (
            <div className="mt-32 pt-24 border-t border-stone-200">
                <h2 className="font-serif text-4xl mb-16 text-center">Vous aimerez aussi</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedProducts.map((rel) => (
                        <Link to={`/product/${rel.id}`} key={rel.id} className="group block">
                            <div className="aspect-[3/4] bg-stone-100 mb-6 overflow-hidden">
                                <img src={rel.image_url} alt={rel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => e.target.src='https://via.placeholder.com/400'}/>
                            </div>
                            <h3 className="font-serif text-xl">{rel.name}</h3>
                            <span className="font-light text-stone-500">{formatPrice(rel.price)}</span>
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