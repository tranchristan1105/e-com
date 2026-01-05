import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, ShoppingBag, Truck, ShieldCheck, ChevronDown, 
  ArrowLeft, Share2, Heart, Check, Plus, Minus, RefreshCw, AlertTriangle, ArrowRight, Zap, Gem
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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

// --- COMPOSANTS UI DARK LUXE ---

const TechSpec = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col p-4 bg-white/5 backdrop-blur-sm rounded-sm border border-white/10 hover:border-yellow-600/50 transition-all duration-300 group">
    <Icon className="text-yellow-600 mb-3 group-hover:scale-110 transition-transform duration-500" size={24} strokeWidth={1} />
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-serif text-gray-200 mt-1">{value}</span>
  </div>
);

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/10 py-5 first:border-t-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left group"
      >
        <span className="font-serif text-lg text-gray-200 group-hover:text-yellow-500 transition-colors tracking-wide">{title}</span>
        <span className={`text-xl text-gray-500 transition-transform duration-500 ${isOpen ? 'rotate-180 text-white' : ''}`}>
          <ChevronDown size={20} strokeWidth={1} />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="text-gray-400 leading-relaxed text-sm font-light">
          {children}
        </div>
      </div>
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0); 
  const [selectedSize, setSelectedSize] = useState('Standard');

  useEffect(() => {
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
          throw new Error("Produit introuvable");
        }
      } catch (e) {
        console.warn("Mode Fallback activé:", e);
        setProduct({
            id: 1,
            name: "La Planche Titan™ (Édition Chef)",
            price: 89.90,
            category: "Signature",
            description: "Forgée dans un titane de grade aérospatial, cette pièce maîtresse redéfinit l'hygiène et l'élégance en cuisine. Surface antibactérienne, inaltérable et garantie à vie.",
            image_url: "https://images.unsplash.com/photo-1628103598586-b4d216f40396?q=80&w=2000&auto=format&fit=crop"
        });
        setRelatedProducts([
            {id: 99, name: "Couteau Damas", price: 149.90, image_url: "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800"},
            {id: 98, name: "Bloc Sommelier", price: 59.90, image_url: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?w=800"}
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
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#1c1917] border border-yellow-600/30 rounded-sm flex items-center justify-center text-yellow-500">
            <ShoppingBag size={20} />
        </div>
        <div>
          <p className="font-serif font-bold text-sm text-gray-900">Ajouté au panier</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{product.name}</p>
        </div>
      </div>, 
      {
        style: { borderRadius: '4px', background: '#fff', border: '1px solid #e7e5e4', padding: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' },
        duration: 4000
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0a09] text-yellow-600">
        <RefreshCw className="animate-spin mb-4" size={32} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-500">Chargement de la pièce...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0a09] text-white">
        <AlertTriangle size={48} className="mb-4 text-yellow-600" />
        <h2 className="text-2xl font-serif mb-4">Pièce introuvable</h2>
        <Link to="/" className="text-xs font-bold uppercase tracking-widest border-b border-yellow-600 pb-1 hover:text-yellow-600 transition-colors">Retour à la collection</Link>
      </div>
    );
  }

  // Image courante
  const currentImage = activeImage === 0 ? product.image_url : `https://source.unsplash.com/random/800x800?sig=${activeImage + product.id}`;

  return (
    <div className="bg-[#0c0a09] min-h-screen font-sans text-gray-200 selection:bg-yellow-600 selection:text-white pb-32">
      
      {/* HEADER NAVIGATION FLOTTANT */}
      <nav className="fixed w-full z-50 top-0 left-0 bg-[#0c0a09]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-white transition-colors group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="hidden sm:inline">Retour Collection</span>
            </Link>
            
            <div className="flex gap-6 text-gray-400">
                <button className="hover:text-yellow-500 transition-colors"><Share2 size={20} strokeWidth={1} /></button>
                <button className="hover:text-yellow-500 transition-colors"><Heart size={20} strokeWidth={1} /></button>
            </div>
        </div>
      </nav>

      <div className="pt-24 max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
            
            {/* GAUCHE : GALERIE IMMERSIVE */}
            <div className="lg:w-7/12 xl:w-2/3 flex flex-col gap-6">
                {/* Image Principale */}
                <div className="w-full aspect-[4/5] relative overflow-hidden group border border-white/5">
                    <img 
                        src={currentImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        onError={(e) => e.target.src='https://via.placeholder.com/1200x1600?text=Image+Non+Disponible'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-transparent to-transparent opacity-60"></div>
                    
                    {/* Badge Catégorie */}
                    <div className="absolute top-6 left-6">
                         <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-4 py-2 uppercase tracking-[0.2em]">
                            {product.category || "Collection"}
                        </span>
                    </div>
                </div>

                {/* Miniatures */}
                <div className="grid grid-cols-4 gap-4">
                     {[0, 1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            onClick={() => setActiveImage(i)} 
                            className={`aspect-square cursor-pointer overflow-hidden border transition-all duration-300 ${activeImage === i ? 'border-yellow-600 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                            <img src={i === 0 ? product.image_url : `https://source.unsplash.com/random/200x200?sig=${i + product.id}`} className="w-full h-full object-cover" alt="thumbnail"/>
                        </div>
                     ))}
                </div>
            </div>

            {/* DROITE : DÉTAILS & COMMANDE */}
            <div className="lg:w-5/12 xl:w-1/3 flex flex-col relative">
                <div className="lg:sticky lg:top-32 space-y-10">
                    
                    {/* Titre & Prix */}
                    <div className="space-y-6 border-b border-white/10 pb-8">
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] tracking-tight">
                            {product.name}
                        </h1>
                        <div className="flex justify-between items-end">
                            <span className="text-3xl font-light text-yellow-500 font-serif">
                                {formatPrice(product.price)}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex text-yellow-600">
                                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                                <span className="text-xs uppercase tracking-widest text-gray-500 border-b border-gray-700 pb-0.5 cursor-pointer hover:text-white hover:border-white transition-colors">
                                    Lire les avis
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 leading-loose font-light text-lg">
                        {product.description}
                    </p>

                    {/* Sélecteurs */}
                    <div className="space-y-4">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Finition</span>
                        <div className="flex gap-4">
                            {['Standard', 'Premium'].map((size) => (
                                <button 
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-6 py-3 border text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedSize === size ? 'border-yellow-600 bg-yellow-600/10 text-white' : 'border-white/20 text-gray-500 hover:border-white/50 hover:text-white'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions d'achat */}
                    <div className="pt-6 space-y-6">
                        <div className="flex gap-4">
                            {/* Compteur */}
                            <div className="flex items-center border border-white/20 h-16 w-32 bg-white/5 backdrop-blur-sm">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white"><Minus size={14}/></button>
                                <span className="flex-1 text-center font-serif text-xl text-white">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white"><Plus size={14}/></button>
                            </div>
                            
                            {/* Bouton Principal */}
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 h-16 bg-white text-black hover:bg-yellow-500 hover:text-black transition-all duration-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-between px-8 group shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                            >
                                <span>Ajouter au panier</span> 
                                <ArrowRight size={18} className="transform group-hover:translate-x-2 transition-transform"/>
                            </button>
                        </div>

                        {/* Réassurance Rapide */}
                        <div className="flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-500 pt-2">
                            <span className="flex items-center gap-2"><Zap size={14} className="text-yellow-600" /> Expédition 24h</span>
                            <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-yellow-600" /> Garantie à vie</span>
                        </div>
                    </div>

                    {/* Grille Specs */}
                    <div className="grid grid-cols-2 gap-4 py-8 border-t border-white/10">
                        <TechSpec icon={Gem} label="Matériau" value="Titane Pur" />
                        <TechSpec icon={ShieldCheck} label="Hygiène" value="Antibactérien" />
                        <TechSpec icon={Truck} label="Livraison" value="Offerte" />
                        <TechSpec icon={RefreshCw} label="Satisfait" value="30 Jours" />
                    </div>

                    {/* Accordéons */}
                    <div>
                        <Accordion title="Caractéristiques & Dimensions">
                            <ul className="list-disc list-inside space-y-2 marker:text-yellow-600">
                                <li>Titane de grade médical (Ti-6Al-4V)</li>
                                <li>Surface micro-texturée anti-rayures</li>
                                <li>Épaisseur : 2mm (Ultra-fin)</li>
                                <li>Poids : 450g</li>
                            </ul>
                        </Accordion>
                        <Accordion title="Entretien & Garantie">
                            <p>Compatible lave-vaisselle. Ne rouille jamais. Garantie à vie contre la déformation et la corrosion.</p>
                        </Accordion>
                    </div>

                </div>
            </div>
        </div>

        {/* SECTION CROSS-SELL (Inspiration) */}
        {relatedProducts.length > 0 && (
            <div className="mt-40 pt-24 border-t border-white/5">
                <div className="flex justify-between items-end mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl text-white">Complétez l'expérience</h2>
                    <Link to="/" className="hidden md:block text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white border-b border-transparent hover:border-white pb-1 transition-all">
                        Voir la collection
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedProducts.map((rel) => (
                        <Link to={`/product/${rel.id}`} key={rel.id} className="group block cursor-pointer">
                            <div className="aspect-[4/5] bg-[#141210] mb-6 overflow-hidden relative border border-white/5 group-hover:border-white/20 transition-colors">
                                <img 
                                    src={rel.image_url} 
                                    alt={rel.name} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                                    onError={(e) => e.target.src='https://via.placeholder.com/600x800'}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-serif text-xl text-white group-hover:text-yellow-500 transition-colors">{rel.name}</h3>
                                    <span className="text-xs uppercase tracking-widest text-gray-600">Accessoire</span>
                                </div>
                                <span className="font-light text-lg text-yellow-600">{formatPrice(rel.price)}</span>
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