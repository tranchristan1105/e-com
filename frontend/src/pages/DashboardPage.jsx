import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, 
  Package, MapPin, Plus, Trash2, X, RefreshCw, AlertTriangle, Tag, Image as ImageIcon,
  Lock, LogOut, LayoutDashboard, Pencil, TrendingUp, Search, Bell, ChevronDown, Filter, Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// --- CONFIGURATION API INTELLIGENTE ---
const getApiUrl = () => {
  // 1. Si on est sur localhost, on utilise le backend local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:8000/api/v1";
  }

  // 2. Sinon, on est en production (Cloud Run)
  // On utilise l'URL de production en dur pour éviter les erreurs de compilation avec import.meta
  return "https://ecommerce-backend-810577747496.europe-west9.run.app/api/v1"; 
};

const API_URL = getApiUrl();

// --- UTILS UI ---
const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price || 0);
const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return dateString; }
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin }) => {
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
      if (!res.ok) throw new Error("Accès refusé");
      const data = await res.json();
      onLogin(data.access_token);
      toast.success("Connexion réussie");
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Empire OS</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input className="w-full p-4 bg-gray-50 border rounded-xl" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Utilisateur" required />
          <input className="w-full p-4 bg-gray-50 border rounded-xl" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" required />
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-all">
            {loading ? <RefreshCw className="animate-spin mx-auto" /> : "Connexion"}
          </button>
        </form>
        <div className="mt-8 text-xs text-center text-gray-400">
            Connecting to: {API_URL}
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANTS DASHBOARD ---
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
    <Icon size={20} className={active ? 'text-blue-600' : ''} />
    <span>{label}</span>
  </button>
);

const KPICard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
    </div>
  </div>
);

const SalesChart = ({ data }) => {
    if (!data || !Array.isArray(data) || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-300 font-medium bg-gray-50 rounded-2xl border border-dashed">Aucune donnée graphique</div>;
    const maxVal = Math.max(...data.map(d => d.amount || 0), 100);
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d.amount || 0) / maxVal) * 100}`).join(' ');
    return (
        <div className="w-full h-72 relative mt-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"/><stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/></linearGradient></defs>
                <path d={`M0,100 ${points} V100 H0 Z`} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
};

const TunnelRow = ({ label, val, total, color }) => (
    <div className="relative h-12 w-full bg-slate-50 rounded-xl overflow-hidden flex items-center px-4 mb-3">
        <div className={`absolute left-0 top-0 h-full ${color}`} style={{ width: `${total > 0 ? (val/total)*100 : 0}%`, opacity: 0.5 }}></div>
        <span className="relative z-10 font-bold text-slate-700 w-1/3 text-sm">{label}</span>
        <span className="relative z-10 font-extrabold text-slate-900 w-1/3 text-center">{val}</span>
        <span className="relative z-10 text-xs font-medium text-slate-500 w-1/3 text-right">{total > 0 ? ((val/total)*100).toFixed(1) : 0}%</span>
    </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
      </div>
      <div className="p-8 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

// --- DASHBOARD PRINCIPAL ---
const DashboardPage = () => {
  const [token, setToken] = useState(localStorage.getItem('empire_token'));
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [chartRange, setChartRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'Divers', image_url: '', description: '' });
  const [orderForm, setOrderForm] = useState({ client: '', amount: '', email: '', items: '', addressLine1: '', city: '', postalCode: '' });

  const authFetch = async (endpoint, options = {}) => {
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) { setToken(null); localStorage.removeItem('empire_token'); throw new Error("Session expirée"); }
    return res;
  };

  const fetchData = async (background = false) => {
    if (!token) return;
    if (!background) setLoading(true);
    
    // On garde l'erreur précédente s'il y en a une, sauf si on refresh manuellement
    if (!background) setErrorMsg(null);

    try {
        console.log(`📡 Fetching data from: ${API_URL}`);
        
        // 1. Produits
        try {
            const prodRes = await fetch(`${API_URL}/products`);
            if (prodRes.ok) setProducts(await prodRes.json());
            else throw new Error("Erreur chargement produits");
        } catch(e) { 
            console.error("Produits:", e); 
            if (!background) setErrorMsg("Impossible de charger les produits. Vérifiez l'URL API.");
        }

        // 2. Commandes
        try {
            const ordRes = await authFetch('/orders');
            if (ordRes.ok) setOrders(await ordRes.json());
        } catch(e) { console.warn("Commandes:", e); }

        // 3. Stats
        try {
            const stRes = await authFetch('/analytics/stats');
            if (stRes.ok) {
                const data = await stRes.json();
                setStats(data);
            } else {
                throw new Error("Erreur stats");
            }
        } catch(e) { 
            console.warn("Stats:", e);
            if (!background && !errorMsg) setErrorMsg("Erreur chargement statistiques. Vérifiez que la base de données est accessible.");
        }

    } catch (e) {
      if (!background) setErrorMsg(e.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // 1. Chargement initial + Auto-Refresh toutes les 5 secondes
  useEffect(() => {
    fetchData(); 
    const interval = setInterval(() => fetchData(true), 5000); 
    return () => clearInterval(interval);
  }, [token]);

  // Fonction pour le bouton manuel
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchData(true);
    toast.success("Actualisation...");
  };

  if (!token) return <LoginScreen onLogin={(t) => { localStorage.setItem('empire_token', t); setToken(t); }} />;

  // --- ACTIONS ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/products/${editingProduct}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify({ ...productForm, image_url: productForm.image_url || "https://via.placeholder.com/300" }) });
      if (res.ok) { toast.success("Enregistré"); setProductModalOpen(false); fetchData(true); }
    } catch (e) { toast.error("Erreur sauvegarde"); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Supprimer ?")) return;
    try { await authFetch(`/products/${id}`, { method: 'DELETE' }); toast.success("Supprimé"); fetchData(true); } catch(e) {}
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
        const items = orderForm.items.split(',');
        const res = await fetch(`${API_URL}/orders`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: orderForm.client, email: orderForm.email, amount: parseFloat(orderForm.amount), items: JSON.stringify(items), date: new Date().toISOString(),
                address: { line1: orderForm.addressLine1, city: orderForm.city, postal_code: orderForm.postalCode, country: 'France' }
            })
        });
        if(res.ok) { toast.success("Commande créée"); setOrderModalOpen(false); fetchData(true); }
    } catch(e) {}
  };

  if (loading && !products.length) return <div className="h-screen flex items-center justify-center flex-col gap-4"><RefreshCw className="animate-spin text-blue-600"/><p className="text-gray-400 text-sm">Connexion à {API_URL}...</p></div>;

  const summary = stats?.summary || {};
  const funnel = summary.funnel || { '1_visitors': 0, '2_interested': 0, '3_converted': 0 };
  const salesCharts = summary.sales_chart || { '7d': [], '30d': [] };
  const chartData = salesCharts[chartRange] || [];
  const topProducts = summary.top_products || {};

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden md:flex shadow-xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
            <div><h1 className="font-bold text-lg tracking-wide">EMPIRE</h1><p className="text-xs text-slate-400">WORKSPACE</p></div>
          </div>
          <div className="mb-4 px-2 py-1 bg-white/10 rounded text-[10px] text-gray-400 break-all">
             API: {API_URL}
          </div>
          <nav className="space-y-2">
            <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <SidebarItem icon={ShoppingBag} label="Commandes" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
            <SidebarItem icon={Tag} label="Produits" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors"><ArrowLeft size={18} /> Boutique</Link>
          <button onClick={() => {setToken(null); localStorage.removeItem('empire_token')}} className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors"><LogOut size={18} /> Déconnexion</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab}</h2>
              {/* BOUTON REFRESH MANUEL */}
              <button 
                onClick={handleManualRefresh}
                className={`p-2 rounded-full hover:bg-gray-100 transition-all ${isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-400'}`}
                title="Actualiser les données"
              >
                <RefreshCw size={18} />
              </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">A</div>
                <div className="text-sm"><p className="font-bold text-gray-900">Admin</p></div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100">
                <AlertTriangle className="flex-shrink-0 mt-0.5"/> 
                <div>
                    <p className="font-bold">Erreur de connexion</p>
                    <p className="text-sm">{errorMsg}</p>
                    <p className="text-xs mt-2 text-red-400">Vérifiez que l'URL API ({API_URL}) est correcte et que le serveur tourne.</p>
                </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Chiffre d'Affaires" value={formatPrice(summary.total_sales)} icon={Trophy} colorClass="bg-green-500 text-green-600" />
                <KPICard title="Commandes" value={summary.total_orders || 0} icon={Package} colorClass="bg-blue-500 text-blue-600" />
                <KPICard title="Visiteurs" value={funnel['1_visitors'] || 0} icon={Users} colorClass="bg-purple-500 text-purple-600" />
                <KPICard title="Panier Moyen" value={formatPrice(summary.total_orders ? summary.total_sales/summary.total_orders : 0)} icon={ShoppingBag} colorClass="bg-orange-500 text-orange-600" />
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {['7d', '30d'].map(r => (<button key={r} onClick={() => setChartRange(r)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartRange === r ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{r}</button>))}
                        </div>
                    </div>
                    <SalesChart data={chartData} />
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Tunnel</h3>
                    <div className="space-y-4">
                        <TunnelRow label="Vues" val={funnel['1_visitors']} total={funnel['1_visitors']} color="bg-slate-200" />
                        <TunnelRow label="Intérêt" val={funnel['2_interested']} total={funnel['1_visitors']} color="bg-purple-200" />
                        <TunnelRow label="Panier" val={funnel['3_converted']} total={funnel['1_visitors']} color="bg-green-200" />
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUITS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Produits</h2>
                    <button onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', category: 'Divers', image_url: '', description: '' }); setProductModalOpen(true); }} className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm flex items-center gap-2"><Plus size={18} /> Nouveau</button>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100"><tr><th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Produit</th><th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Prix</th><th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4"><div className="flex items-center gap-4"><img src={p.image_url} className="w-12 h-12 rounded-lg bg-gray-100 object-cover" onError={(e)=>e.target.src='https://via.placeholder.com/50'}/><span className="font-bold">{p.name}</span></div></td>
                                    <td className="px-6 py-4 font-mono font-medium">{formatPrice(p.price)}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => { setEditingProduct(p.id); setProductForm(p); setProductModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Pencil size={16}/></button>
                                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* COMMANDES */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Commandes</h2><button onClick={() => setOrderModalOpen(true)} className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50"><Plus size={18} /></button></div>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100"><tr><th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">ID</th><th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Client</th><th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Total</th><th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs">Date</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{order.id}</td>
                                    <td className="px-6 py-4"><p className="font-bold">{order.customer || "Inconnu"}</p><p className="text-xs text-gray-500">{order.email}</p></td>
                                    <td className="px-6 py-4 font-bold">{formatPrice(order.amount)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.date)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {isProductModalOpen && (
        <Modal title={editingProduct ? "Modifier" : "Nouveau Produit"} onClose={() => setProductModalOpen(false)}>
            <form onSubmit={handleSaveProduct} className="grid md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1 space-y-4">
                    <input className="w-full p-3 border rounded-xl" placeholder="Nom" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                    <input className="w-full p-3 border rounded-xl" placeholder="Prix" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                    <textarea className="w-full p-3 border rounded-xl h-32" placeholder="Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-4">
                    <input className="w-full p-3 border rounded-xl" placeholder="Image URL" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
                    <div className="h-48 bg-gray-100 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden">
                        {productForm.image_url ? <img src={productForm.image_url} className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/200'}/> : <span className="text-gray-400">Aperçu</span>}
                    </div>
                    <button className="w-full bg-black text-white font-bold py-3.5 rounded-xl">Enregistrer</button>
                </div>
            </form>
        </Modal>
      )}

      {isOrderModalOpen && (
        <Modal title="Nouvelle Commande" onClose={() => setOrderModalOpen(false)}>
            <form onSubmit={handleAddOrder} className="grid grid-cols-2 gap-6">
                <input className="col-span-2 w-full p-3 border rounded-xl" placeholder="Client" value={orderForm.client} onChange={e => setOrderForm({...orderForm, client: e.target.value})} />
                <input className="w-full p-3 border rounded-xl" placeholder="Email" value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} />
                <input className="w-full p-3 border rounded-xl" placeholder="Montant" type="number" value={orderForm.amount} onChange={e => setOrderForm({...orderForm, amount: e.target.value})} />
                <input className="col-span-2 w-full p-3 border rounded-xl" placeholder="Produits (virgule)" value={orderForm.items} onChange={e => setOrderForm({...orderForm, items: e.target.value})} />
                <button className="col-span-2 bg-black text-white font-bold py-3.5 rounded-xl">Enregistrer</button>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;