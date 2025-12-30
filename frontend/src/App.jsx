import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Activity, MousePointer, Package } from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = "http://localhost:8000/api/v1"; 

// --- CUSTOM HOOK: useTracking ---
const useTracking = (userId) => {
  const trackEvent = useCallback(async (eventType, metadata = {}) => {
    const payload = {
      event_type: eventType,
      user_id: userId,
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      metadata: metadata
    };

    console.log("📡 Tracking sent:", payload);

    try {
      await fetch(`${API_URL}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      // On ignore les erreurs silencieusement pour ne pas bloquer l'app
      console.warn("Tracking unreachable");
    }
  }, [userId]);

  return { trackEvent };
};

// --- COMPOSANTS UI ---
const ProductCard = ({ product, onAddToCart, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100 cursor-pointer"
    onClick={() => onClick(product)}
  >
    <div className="h-32 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
      <Package className="text-gray-400 w-12 h-12" />
    </div>
    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
    <p className="text-gray-500 text-sm mb-3">{product.category}</p>
    <div className="flex justify-between items-center">
      <span className="text-xl font-bold text-blue-600">{product.price} €</span>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Ajouter
      </button>
    </div>
  </div>
);

const AnalyticsDashboard = ({ events }) => (
  <div className="fixed bottom-4 right-4 bg-gray-900 text-green-400 p-4 rounded-lg shadow-2xl w-80 text-xs font-mono border border-green-800 opacity-90 z-50">
    <div className="flex items-center gap-2 mb-2 border-b border-green-800 pb-2">
      <Activity size={16} />
      <span className="font-bold">LIVE TRACKING CONSOLE</span>
    </div>
    <div className="h-40 overflow-y-auto space-y-1">
      {events.length === 0 && <span className="text-gray-500">Waiting for events...</span>}
      {events.map((ev, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-gray-500">[{ev.time}]</span>
          <span className="text-white">{ev.type}</span>
        </div>
      ))}
    </div>
  </div>
);

// --- APP PRINCIPALE ---
export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);
  
  // CORRECTION BOUCLE INFINIE :
  // On génère l'ID une seule fois au chargement de la page
  const [sessionId] = useState(() => "user_" + Math.floor(Math.random() * 10000));
  const { trackEvent } = useTracking(sessionId);

  const logEventToUI = (type) => {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    setRecentEvents(prev => [{type, time}, ...prev].slice(0, 50));
  };

  // Chargement des produits
  useEffect(() => {
    let isMounted = true; // Protection contre les appels fantômes

    const fetchProducts = async () => {
      try {
        const fallbackData = [
          {id: "1", name: "Smartphone Pro", price: 999, category: "Tech"},
          {id: "2", name: "Laptop Slim", price: 1299, category: "Tech"},
          {id: "3", name: "Café Bio", price: 15, category: "Food"},
        ];
        
        try {
          const res = await fetch(`${API_URL}/products`);
          if (!res.ok) throw new Error("API failed");
          const data = await res.json();
          if (isMounted) setProducts(data);
        } catch (e) {
          console.warn("Utilisation données de secours");
          if (isMounted) setProducts(fallbackData);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    
    // On ne met PAS trackEvent dans les dépendances pour éviter la boucle au démarrage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Handlers
  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    trackEvent('add_to_cart', { product_id: product.id });
    logEventToUI(`add: ${product.name}`);
  };

  const handleProductClick = (product) => {
    trackEvent('select_content', { item_id: product.id });
    logEventToUI(`click: ${product.name}`);
    alert(`Détails: ${product.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <span className="font-bold text-xl tracking-tight">E-Shop</span>
            </div>
          </div>
          <div className="relative p-2 text-gray-600">
            <ShoppingCart />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Nos Produits</h1>
        
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                onClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </main>
      <AnalyticsDashboard events={recentEvents} />
    </div>
  );
}