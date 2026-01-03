import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, 
  Package, MapPin, Plus, Trash2, X, RefreshCw, AlertOctagon, ArrowRight, Tag, Image as ImageIcon,
  Lock, LogOut, LayoutDashboard, Pencil, TrendingUp, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Gestion sécurisée de l'URL API (Compatible ES2015/Vite)
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

// --- COMPOSANTS UI ---
const LoginScreen = ({ onLogin }) => {
  // ... (Code Login inchangé)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const res = await fetch(`${API_URL}/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData });
      if (!res.ok) throw new Error("Identifiants incorrects");
      const data = await res.json();
      onLogin(data.access_token);
      toast.success("Connexion réussie");
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-200"><Lock size={32} /></div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Empire Dashboard</h1>
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <input className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Utilisateur" required />
          <input className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" required />
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all">{loading ? "..." : "Se connecter"}</button>
        </form>
      </div>
    </div>
  );
};

// COMPOSANT GRAPHIQUE SVG (Adaptatif)
const SalesChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-400">Pas de données</div>;
    
    const maxVal = Math.max(...data.map(d => d.amount), 100); 
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.amount / maxVal) * 100;
        return `${x},${y}`;
    }).join(' ');

    // On espace les labels si on a beaucoup de données (30 jours)
    const step = data.length > 10 ? 5 : 1;

    return (
        <div className="w-full h-48 relative mt-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />
                
                <path d={`M0,100 ${points} V100 H0 Z`} fill="url(#gradient)" opacity="0.2" />
                <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
            
            <div className="flex justify-between mt-2 text-xs text-slate-400 relative h-4">
                {data.map((d, i) => {
                    // Affichage intelligent des dates
                    if (i === 0 || i === data.length - 1 || i % step === 0) {
                        // Position absolue pour éviter que les textes ne se poussent
                        const leftPos = (i / (data.length - 1)) * 100;
                        return (
                            <span key={i} style={{ position: 'absolute', left: `${leftPos}%`, transform: 'translateX(-50%)' }}>
                                {new Date(d.date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}
                            </span>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

// --- DASHBOARD PRINCIPAL ---
const DashboardPage = () => {
  const [token, setToken] = useState(localStorage.getItem('empire_token'));
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  
  // NOUVEAU : État pour la plage de dates ('7d' ou '30d')
  const [chartRange, setChartRange] = useState('7d'); 
  
  const [loading, setLoading] = useState(true);
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'Divers', image_url: '', description: '' });
  const [orderForm, setOrderForm] = useState({ client: '', amount: '', email: '', items: '', addressLine1: '', city: '', postalCode: '' });

  const authFetch = async (endpoint, options = {}) => {
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) { setToken(null); localStorage.removeItem('empire_token'); throw new Error("Unauthorized"); }
    return res;
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ordersRes, statsRes, prodRes] = await Promise.all([
        authFetch('/orders'), authFetch('/analytics/stats'), fetch(`${API_URL}/products`)
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (e) { console.error("Erreur chargement", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  if (!token) return <LoginScreen onLogin={(t) => { localStorage.setItem('empire_token', t); setToken(t); }} />;

  // --- ACTIONS ---
  const toggleProductForm = () => {
    if (showProductForm) { setShowProductForm(false); setEditingProduct(null); setProductForm({ name: '', price: '', category: 'Divers', image_url: '', description: '' }); } 
    else { setShowProductForm(true); }
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product.id);
    setProductForm({ name: product.name, price: product.price, category: product.category, image_url: product.image_url, description: product.description || '' });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/products/${editingProduct}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify({ ...productForm, image_url: productForm.image_url || "https://via.placeholder.com/300" }) });
      if (res.ok) { toast.success("Enregistré !"); toggleProductForm(); fetchData(); }
    } catch (e) { toast.error("Erreur sauvegarde"); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Supprimer ?")) return;
    try { await authFetch(`/products/${id}`, { method: 'DELETE' }); toast.success("Supprimé"); setProducts(prev => prev.filter(p => p.id !== id)); } catch (e) {}
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
        const itemsArray = orderForm.items.split(',').map(item => item.trim()).filter(i => i);
        const res = await fetch(`${API_URL}/orders`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: orderForm.client, email: orderForm.email, amount: parseFloat(orderForm.amount), items: JSON.stringify(itemsArray), date: new Date().toISOString(),
                address: { line1: orderForm.addressLine1, city: orderForm.city, postal_code: orderForm.postalCode, country: 'France' }
            })
        });
        if(res.ok) { toast.success("Commande créée"); setShowOrderForm(false); fetchData(); }
    } catch(e) { toast.error("Erreur commande"); }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Supprimer ?")) return;
    toast.error("Suppression non implémentée");
  };

  const handleLogout = () => { setToken(null); localStorage.removeItem('empire_token'); };

  if (loading && !products.length) return <div className="h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-blue-600"/></div>;

  const summary = stats?.summary || { total_sales: 0, total_events: 0 };
  
  // SÉLECTION DES DONNÉES EN FONCTION DU RANGE
  // On récupère soit le set '7d' soit le set '30d' depuis l'API
  const salesChartData = summary.sales_chart ? summary.sales_chart[chartRange] : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-lg"><LayoutDashboard size={24}/></div> Empire QG
          </h1>
          <div className="flex gap-4">
            <Link to="/" className="flex items-center text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200"><ArrowLeft size={18} className="mr-2" /> Boutique</Link>
            <button onClick={handleLogout} className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100"><LogOut size={18} className="mr-2" /> Sortir</button>
          </div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-slate-200 overflow-x-auto">
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={16}/>}>Analytics</TabButton>
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={16}/>}>Commandes</TabButton>
            <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Tag size={16}/>}>Produits</TabButton>
        </div>

        {/* --- ANALYTICS --- */}
        {activeTab === 'analytics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Vues Totales" value={summary.total_events} icon={<Users size={24} />} color="blue" />
                    <StatCard title="Commandes" value={summary.total_orders} icon={<Package size={24} />} color="purple" />
                    <StatCard title="Panier Moyen" value={`${summary.total_orders > 0 ? (summary.total_sales/summary.total_orders).toFixed(0) : 0} €`} icon={<ShoppingBag size={24} />} color="orange" />
                    <StatCard title="CA Total" value={`${summary.total_sales} €`} icon={<Trophy size={24} />} color="green" />
                </div>

                {/* GRAPHIQUE DES VENTES AVEC TOGGLE */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="text-blue-600"/> Évolution Ventes
                            </h2>
                            {/* BOUTONS TOGGLE */}
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button 
                                    onClick={() => setChartRange('7d')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartRange === '7d' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    7 Jours
                                </button>
                                <button 
                                    onClick={() => setChartRange('30d')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${chartRange === '30d' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    30 Jours
                                </button>
                            </div>
                        </div>
                        <SalesChart data={salesChartData} />
                    </div>
                    
                    {/* Tunnel */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Tunnel</h2>
                        <div className="space-y-6">
                            <TunnelRow label="Vues Site" val={summary.funnel['1_visitors']} total={summary.funnel['1_visitors']} color="bg-slate-200" />
                            <TunnelRow label="Produits Vus" val={summary.funnel['2_interested']} total={summary.funnel['1_visitors']} color="bg-purple-200" />
                            <TunnelRow label="Ajouts Panier" val={summary.funnel['3_converted']} total={summary.funnel['1_visitors']} color="bg-green-200" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Top Produits</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(summary.top_products || {}).map(([name, count], i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="font-medium text-slate-700">{name}</span>
                                <span className="font-bold text-blue-600">{count} vues/ajouts</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- PRODUITS --- */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Catalogue</h2>
              <button onClick={toggleProductForm} className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-white ${showProductForm ? 'bg-slate-500' : 'bg-blue-600'}`}>
                {showProductForm ? <><X size={18}/> Fermer</> : <><Plus size={18}/> Nouveau</>}
              </button>
            </div>
            
            {showProductForm && (
               <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8 border-l-4 border-l-blue-600">
                 <h3 className="font-bold text-lg mb-4">{editingProduct ? 'Modifier' : 'Ajouter'}</h3>
                 <form onSubmit={handleSaveProduct} className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-4">
                        <input className="border p-2.5 rounded-lg w-full" placeholder="Nom" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                        <div className="flex gap-2">
                            <input className="border p-2.5 rounded-lg w-full" placeholder="Prix" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                            <select className="border p-2.5 rounded-lg bg-white" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                                <option>Divers</option><option>Smartphone</option><option>Ordinateur</option><option>Audio</option><option>Mode</option>
                            </select>
                        </div>
                        <textarea className="border p-2.5 rounded-lg w-full h-24" placeholder="Description..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                        <input className="border p-2.5 rounded-lg w-full" placeholder="Image URL" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
                        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Enregistrer</button>
                    </div>
                 </form>
               </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative">
                        <div className="aspect-square bg-slate-100 relative">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/300'} />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditProductClick(product)} className="bg-white p-2 rounded-full text-blue-600 shadow"><Pencil size={16}/></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="bg-white p-2 rounded-full text-red-500 shadow"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-slate-900">{product.name}</h3>
                            <span className="text-blue-600 font-bold">{product.price} €</span>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* --- COMMANDES --- */}
        {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Commandes</h2>
                    <button onClick={() => setShowOrderForm(!showOrderForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"><Plus size={18}/> Créer</button>
                </div>
                {/* Formulaire commande identique... */}
                {orders.map(order => (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-6 flex justify-between items-center shadow-sm">
                        <div>
                            <h3 className="font-bold">Commande #{order.id}</h3>
                            <p className="text-sm text-slate-500">{order.email} • {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">{order.amount} €</p>
                            <p className="text-xs text-green-600 uppercase font-bold bg-green-50 px-2 py-1 rounded inline-block mt-1">{order.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

// UI Components
const TabButton = ({ active, onClick, icon, children }) => (
    <button onClick={onClick} className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${active ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>{icon} {children}</button>
);
const StatCard = ({ title, value, icon, color }) => {
    const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600' };
    return (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-slate-500">{title}</p><h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3></div><div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div></div></div>);
};
const TunnelRow = ({ label, val, total, color }) => (
    <div className="relative h-10 w-full bg-slate-50 rounded-lg overflow-hidden flex items-center px-4">
        <div className={`absolute left-0 top-0 h-full ${color}`} style={{ width: `${total > 0 ? (val/total)*100 : 0}%`, opacity: 0.5 }}></div>
        <span className="relative z-10 font-medium text-slate-700 w-1/3">{label}</span>
        <span className="relative z-10 font-bold text-slate-900 w-1/3 text-center">{val}</span>
        <span className="relative z-10 text-xs text-slate-500 w-1/3 text-right">{total > 0 ? ((val/total)*100).toFixed(1) : 0}%</span>
    </div>
);

export default DashboardPage;