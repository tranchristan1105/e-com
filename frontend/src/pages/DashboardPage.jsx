import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, 
  Package, MapPin, Plus, Trash2, X, RefreshCw, AlertOctagon, ArrowRight, Tag, Image as ImageIcon,
  Lock, LogOut, LayoutDashboard, Pencil, TrendingUp, Search, Bell, ChevronDown, Filter, MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// --- CONFIGURATION API ---
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

// --- UTILS UI ---
const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price || 0);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

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
      toast.success("Bienvenue, CEO.");
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Empire OS</h1>
          <p className="text-gray-500 mt-2 font-medium">Connectez-vous à votre quartier général.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Identifiant</label>
            <input className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Mot de passe</label>
            <input className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-medium" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-400/20 disabled:opacity-70 disabled:hover:scale-100 flex justify-center">
            {loading ? <RefreshCw className="animate-spin" /> : "Initialiser le système"}
          </button>
        </form>
      </div>
      <p className="mt-8 text-xs text-gray-400 font-mono">SECURED BY EMPIRE TECHNOLOGY • V1.0</p>
    </div>
  );
};

// --- COMPOSANTS DASHBOARD ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-white text-black shadow-sm font-semibold' 
        : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
    }`}
  >
    <Icon size={20} className={`transition-colors ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-white'}`} />
    <span>{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
  </button>
);

const KPICard = ({ title, value, trend, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
        <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} className="mr-1" /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
    </div>
  </div>
);

const SalesChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-300 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">Données insuffisantes</div>;
    
    const maxVal = Math.max(...data.map(d => d.amount), 100);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.amount / maxVal) * 100;
        return `${x},${y}`;
    }).join(' ');

    const step = data.length > 10 ? 5 : 1;

    return (
        <div className="w-full h-72 relative mt-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#f1f5f9" strokeWidth="0.5" />
                
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d={`M0,100 ${points} V100 H0 Z`} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="drop-shadow-lg" />
            </svg>
            
            <div className="flex justify-between mt-2 text-xs text-slate-400 relative h-4">
                {data.map((d, i) => {
                    if (i === 0 || i === data.length - 1 || i % step === 0) {
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

const TunnelRow = ({ label, val, total, color }) => (
    <div className="relative h-12 w-full bg-slate-50 rounded-xl overflow-hidden flex items-center px-4 mb-3">
        <div className={`absolute left-0 top-0 h-full ${color}`} style={{ width: `${total > 0 ? (val/total)*100 : 0}%`, opacity: 0.5, transition: 'width 1s ease-in-out' }}></div>
        <span className="relative z-10 font-bold text-slate-700 w-1/3 text-sm">{label}</span>
        <span className="relative z-10 font-extrabold text-slate-900 w-1/3 text-center">{val}</span>
        <span className="relative z-10 text-xs font-medium text-slate-500 w-1/3 text-right">{total > 0 ? ((val/total)*100).toFixed(1) : 0}%</span>
    </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900"><X size={20} /></button>
      </div>
      <div className="p-8 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---
const DashboardPage = () => {
  const [token, setToken] = useState(localStorage.getItem('empire_token'));
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [chartRange, setChartRange] = useState('30d');
  
  // Modals state
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Forms
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'Divers', image_url: '', description: '' });
  const [orderForm, setOrderForm] = useState({ client: '', amount: '', email: '', items: '', addressLine1: '', city: '', postalCode: '' });

  const [loading, setLoading] = useState(true);

  // -- Fetch Logic --
  const authFetch = async (endpoint, options = {}) => {
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (res.status === 401) { setToken(null); localStorage.removeItem('empire_token'); throw new Error("Unauthorized"); }
    return res;
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    
    // 1. Charger les produits (PUBLIC) - Essentiel pour la gestion de stock
    try {
        const prodRes = await fetch(`${API_URL}/products`);
        if (prodRes.ok) {
            const data = await prodRes.json();
            setProducts(data);
        }
    } catch (e) { console.error("Crash fetch produits", e); }

    // 2. Charger les commandes (PRIVÉ)
    try {
        const ordersRes = await authFetch('/orders');
        if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (e) { console.warn("Erreur chargement commandes", e); }

    // 3. Charger les stats (PRIVÉ)
    try {
        const statsRes = await authFetch('/analytics/stats');
        if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) { console.warn("Erreur chargement stats", e); }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [token]);

  if (!token) return <LoginScreen onLogin={(t) => { localStorage.setItem('empire_token', t); setToken(t); }} />;

  // -- Handlers --
  const openProductModal = (product = null) => {
    setEditingProduct(product ? product.id : null);
    setProductForm(product 
      ? { name: product.name, price: product.price, category: product.category, image_url: product.image_url, description: product.description || '' }
      : { name: '', price: '', category: 'Divers', image_url: '', description: '' }
    );
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/products/${editingProduct}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify({ ...productForm, image_url: productForm.image_url || "https://via.placeholder.com/300" }) });
      if (res.ok) { toast.success(editingProduct ? "Produit mis à jour" : "Produit créé"); setProductModalOpen(false); fetchData(); }
    } catch (e) { toast.error("Erreur sauvegarde"); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try { await authFetch(`/products/${id}`, { method: 'DELETE' }); toast.success("Supprimé"); fetchData(); } catch(e) {}
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
        const itemsArray = orderForm.items.split(',').map(i => i.trim()).filter(i => i);
        const res = await fetch(`${API_URL}/orders`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: orderForm.client, email: orderForm.email, amount: parseFloat(orderForm.amount), items: JSON.stringify(itemsArray), date: new Date().toISOString(),
                address: { line1: orderForm.addressLine1, city: orderForm.city, postal_code: orderForm.postalCode, country: 'France' }
            })
        });
        if(res.ok) { toast.success("Commande créée"); setOrderModalOpen(false); fetchData(); }
    } catch(e) { toast.error("Erreur commande"); }
  };

  // Valeurs par défaut robustes
  const summary = stats?.summary || { 
    total_sales: 0, total_events: 0, total_orders: 0,
    funnel: { '1_visitors': 0, '2_interested': 0, '3_converted': 0 },
    sales_chart: { '7d': [], '30d': [] },
    top_products: {}
  };
  const chartData = summary.sales_chart ? summary.sales_chart[chartRange] : [];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col hidden md:flex shadow-xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <span className="font-bold text-xl">E</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide">EMPIRE</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wider">WORKSPACE</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <SidebarItem icon={BarChart3} label="Vue d'ensemble" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <SidebarItem icon={ShoppingBag} label="Commandes" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
            <SidebarItem icon={Tag} label="Produits" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> Retour Boutique
          </Link>
          <button onClick={() => {setToken(null); localStorage.removeItem('empire_token')}} className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab === 'analytics' ? "Tableau de bord" : activeTab}</h2>
            <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 ml-8 w-64 focus-within:ring-2 focus-within:ring-black/5 transition-all">
                <Search size={16} className="text-gray-400 mr-2" />
                <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    A
                </div>
                <div className="text-sm">
                    <p className="font-bold text-gray-900 leading-none">Admin</p>
                    <p className="text-xs text-gray-500 mt-0.5">Super User</p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          
          {/* VUE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Chiffre d'Affaires" value={formatPrice(summary.total_sales)} trend="+12%" icon={Trophy} colorClass="bg-green-500 text-green-600" />
                <KPICard title="Commandes" value={summary.total_orders} trend="+5%" icon={Package} colorClass="bg-blue-500 text-blue-600" />
                <KPICard title="Visiteurs" value={summary.funnel['1_visitors']} trend="-2%" icon={Users} colorClass="bg-purple-500 text-purple-600" />
                <KPICard title="Panier Moyen" value={formatPrice(summary.total_orders ? summary.total_sales/summary.total_orders : 0)} icon={ShoppingBag} colorClass="bg-orange-500 text-orange-600" />
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Performance Financière</h3>
                            <p className="text-sm text-gray-500 mt-1">Aperçu des revenus sur la période</p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {['7d', '30d'].map(r => (
                                <button key={r} onClick={() => setChartRange(r)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${chartRange === r ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {r === '7d' ? '7 Jours' : '30 Jours'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SalesChart data={chartData} />
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Tunnel de Conversion</h3>
                        <div className="space-y-4">
                            <TunnelRow label="Vues Site" val={summary.funnel['1_visitors']} total={summary.funnel['1_visitors']} color="bg-slate-200" />
                            <TunnelRow label="Produits Vus" val={summary.funnel['2_interested']} total={summary.funnel['1_visitors']} color="bg-purple-200" />
                            <TunnelRow label="Ajouts Panier" val={summary.funnel['3_converted']} total={summary.funnel['1_visitors']} color="bg-green-200" />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Top Produits</h3>
                        <div className="space-y-4">
                            {Object.entries(summary.top_products || {}).map(([name, count], i) => (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-default">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold group-hover:bg-white group-hover:shadow-md transition-all">#{i+1}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{name}</p>
                                        <p className="text-xs text-gray-500">{count} interactions</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-black">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* VUE PRODUITS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"><Filter size={16}/> Filtres</button>
                    </div>
                    <button onClick={() => openProductModal()} className="px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-900 shadow-lg shadow-gray-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <Plus size={18} /> Nouveau Produit
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Produit</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Prix</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                <img src={p.image_url} className="w-full h-full object-cover" alt="" onError={(e) => e.target.src = 'https://via.placeholder.com/50'} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{p.description || "Aucune description"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{p.category}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{formatPrice(p.price)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openProductModal(p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={16}/></button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* VUE COMMANDES */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"><Filter size={16}/> Tout</button>
                    </div>
                    <button onClick={() => setOrderModalOpen(true)} className="px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm flex items-center gap-2">
                        <Plus size={18} /> Commande Manuelle
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Commande</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{order.customer || "Inconnu"}</p>
                                        <p className="text-xs text-gray-500">{order.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.date)}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(order.amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {order.status === 'paid' ? 'Payée' : order.status}
                                        </span>
                                    </td>
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
        <Modal title={editingProduct ? "Modifier le produit" : "Nouveau Produit"} onClose={() => setProductModalOpen(false)}>
            <form onSubmit={handleSaveProduct} className="grid md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nom du produit</label>
                        <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Prix</label>
                            <input type="number" step="0.01" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                                <option>Divers</option><option>Vêtements</option><option>Accessoires</option><option>Électronique</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition h-32 resize-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                        <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                        {productForm.image_url ? (
                            <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/300?text=No+Image'} />
                        ) : (
                            <div className="text-center text-gray-400">
                                <ImageIcon className="mx-auto mb-2 opacity-50" />
                                <span className="text-xs">Aperçu</span>
                            </div>
                        )}
                    </div>
                    <button type="submit" className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all mt-auto shadow-lg shadow-gray-200">
                        {editingProduct ? "Mettre à jour" : "Créer le produit"}
                    </button>
                </div>
            </form>
        </Modal>
      )}

      {isOrderModalOpen && (
        <Modal title="Nouvelle Commande" onClose={() => setOrderModalOpen(false)}>
            <form onSubmit={handleAddOrder} className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Client</label>
                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Nom complet" value={orderForm.client} onChange={e => setOrderForm({...orderForm, client: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Montant</label>
                    <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={orderForm.amount} onChange={e => setOrderForm({...orderForm, amount: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Produits (séparés par virgule)</label>
                    <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={orderForm.items} onChange={e => setOrderForm({...orderForm, items: e.target.value})} />
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                    <h4 className="font-bold text-sm text-gray-900 mb-4">Adresse de livraison</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <input className="col-span-2 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Adresse" value={orderForm.addressLine1} onChange={e => setOrderForm({...orderForm, addressLine1: e.target.value})} />
                        <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Code Postal" value={orderForm.postalCode} onChange={e => setOrderForm({...orderForm, postalCode: e.target.value})} />
                        <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Ville" value={orderForm.city} onChange={e => setOrderForm({...orderForm, city: e.target.value})} />
                    </div>
                </div>
                <button type="submit" className="col-span-2 bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg mt-4">
                    Enregistrer la commande
                </button>
            </form>
        </Modal>
      )}

    </div>
  );
};

export default DashboardPage;