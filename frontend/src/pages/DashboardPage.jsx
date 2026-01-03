import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, 
  Package, MapPin, Plus, Trash2, X, RefreshCw, AlertOctagon, ArrowRight, Tag, Image as ImageIcon,
  Lock, LogOut, LayoutDashboard, Pencil
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// URL Dynamique
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

// --- COMPOSANT LOGIN ---
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
      const res = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!res.ok) throw new Error("Identifiants incorrects");
      
      const data = await res.json();
      onLogin(data.access_token);
      toast.success("Connexion réussie");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-200">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Empire Dashboard</h1>
          <p className="text-slate-500">Accès sécurisé administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Identifiant</label>
            <input 
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="admin"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input 
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : "Se connecter"}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400">
          Défaut: admin / admin
        </div>
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
  const [activeTab, setActiveTab] = useState('analytics'); // Remis par défaut sur Analytics
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // État pour savoir si on modifie

  // Forms
  const [productForm, setProductForm] = useState({ name: '', price: '', category: 'Divers', image_url: '', description: '' });
  const [orderForm, setOrderForm] = useState({ client: '', amount: '', email: '', items: '', addressLine1: '', city: '', postalCode: '' });

  const authFetch = async (endpoint, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (res.status === 401) {
      setToken(null);
      localStorage.removeItem('empire_token');
      toast.error("Session expirée");
      throw new Error("Unauthorized");
    }
    
    return res;
  };

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [ordersRes, statsRes, prodRes] = await Promise.all([
        authFetch('/orders'),
        authFetch('/analytics/stats'),
        fetch(`${API_URL}/products`)
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      
    } catch (e) {
      console.error("Erreur chargement", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (!token) {
    return <LoginScreen onLogin={(newToken) => {
      localStorage.setItem('empire_token', newToken);
      setToken(newToken);
    }} />;
  }

  // --- ACTIONS PRODUITS ---
  
  // Gestion de l'ouverture du formulaire (Ajout ou Reset)
  const toggleProductForm = () => {
    if (showProductForm) {
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: 'Divers', image_url: '', description: '' });
    } else {
      setShowProductForm(true);
    }
  };

  // Préparer la modification
  const handleEditProductClick = (product) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      description: product.description || ''
    });
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonter vers le formulaire
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const isEdit = !!editingProduct;
    const toastId = toast.loading(isEdit ? "Modification..." : "Création...");

    try {
      const url = isEdit ? `/products/${editingProduct}` : '/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method: method,
        body: JSON.stringify({ ...productForm, image_url: productForm.image_url || "https://via.placeholder.com/300" })
      });
      
      if (res.ok) {
        toast.success(isEdit ? "Produit modifié !" : "Produit créé !");
        toggleProductForm(); // Fermer et reset
        fetchData();
      } else {
        throw new Error("Erreur serveur");
      }
    } catch (e) { toast.error("Erreur sauvegarde", { id: toastId }); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Supprimer ?")) return;
    try {
      await authFetch(`/products/${id}`, { method: 'DELETE' });
      toast.success("Supprimé");
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {}
  };

  // --- ACTIONS COMMANDES ---
  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
        const itemsArray = orderForm.items.split(',').map(item => item.trim()).filter(i => i);
        const res = await fetch(`${API_URL}/orders`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: orderForm.client,
                email: orderForm.email || 'client@email.com',
                amount: parseFloat(orderForm.amount),
                items: JSON.stringify(itemsArray),
                date: new Date().toISOString(),
                address: { 
                    line1: orderForm.addressLine1 || '',
                    city: orderForm.city || '',
                    postal_code: orderForm.postalCode || '',
                    country: 'France' 
                }
            })
        });
        if(res.ok) {
            toast.success("Commande créée");
            setShowOrderForm(false);
            setOrderForm({ client: '', amount: '', email: '', items: '', addressLine1: '', city: '', postalCode: '' });
            fetchData();
        }
    } catch(e) { toast.error("Erreur commande"); }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Supprimer ?")) return;
    try {
      toast.error("Suppression commande non implémentée côté API pour l'instant (à ajouter dans main.py)");
    } catch(e) {}
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('empire_token');
    toast('Déconnecté');
  };

  // --- RENDER DASHBOARD ---
  if (loading && !products.length) return <div className="h-screen flex items-center justify-center"><RefreshCw className="animate-spin text-blue-600"/></div>;

  const summary = stats?.summary || { total_sales: 0, total_events: 0, breakdown: {} };
  const views = summary.breakdown?.page_view || 0;
  const productViews = summary.breakdown?.view_item || 0;
  const addToCarts = summary.breakdown?.add_to_cart || 0;
  
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2 rounded-lg"><LayoutDashboard size={24}/></div>
              Empire QG
            </h1>
            <p className="text-slate-500 mt-1">Connecté en tant que <strong>Admin</strong></p>
          </div>
          <div className="flex gap-4">
            <Link to="/" className="flex items-center text-slate-600 hover:text-slate-900 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200">
               <ArrowLeft size={18} className="mr-2" /> Boutique
            </Link>
            <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-700 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-100 transition-colors">
               <LogOut size={18} className="mr-2" /> Déconnexion
            </button>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 overflow-x-auto">
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={16}/>}>Analytics</TabButton>
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag size={16}/>}>Commandes</TabButton>
            <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Tag size={16}/>}>Produits</TabButton>
        </div>

        {/* --- CONTENU : ANALYTICS --- */}
        {activeTab === 'analytics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                {!stats ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center text-yellow-800">
                    <AlertOctagon className="mx-auto mb-2" /> Pas de données analytiques.
                  </div>
                ) : (
                  <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Vues Totales" value={summary.total_events} icon={<BarChart3 size={24} />} color="blue" />
                        <StatCard title="Intérêt Produits" value={productViews} icon={<MousePointer size={24} />} color="purple" />
                        <StatCard title="Ajouts Panier" value={addToCarts} icon={<ShoppingBag size={24} />} color="green" />
                        <StatCard title="Visiteurs Uniques" value={views} icon={<Users size={24} />} color="orange" />
                    </div>

                    {/* Tunnel de Vente Visuel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Tunnel de Conversion</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                            <TunnelStep value={views} label="Vues Site" color="bg-slate-50 text-slate-700" />
                            <ArrowRight className="text-slate-300 hidden md:block" />
                            <TunnelStep 
                                value={productViews} 
                                label="Produits Vus" 
                                sub={`${views > 0 ? ((productViews/views)*100).toFixed(1) : 0}%`} 
                                color="bg-purple-50 text-purple-700" 
                            />
                            <ArrowRight className="text-slate-300 hidden md:block" />
                            <TunnelStep 
                                value={addToCarts} 
                                label="Ajouts Panier" 
                                sub={`${productViews > 0 ? ((addToCarts/productViews)*100).toFixed(1) : 0}%`} 
                                color="bg-green-50 text-green-700" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Top Produits */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Trophy className="text-yellow-500" size={20} />
                                <h2 className="text-lg font-bold text-slate-800">Top Produits</h2>
                            </div>
                            <div className="space-y-5">
                                {Object.entries(summary.top_products || {}).map(([name, count], index) => (
                                    <div key={name}>
                                        <div className="flex justify-between items-center text-sm mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                                                <span className="font-medium text-slate-700 truncate max-w-[150px]">{name}</span>
                                            </div>
                                            <span className="text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(count / (Math.max(...Object.values(summary.top_products || {0:1})))) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logs */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100"><h2 className="text-lg font-bold text-slate-800">Activités Récentes</h2></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-900 font-semibold"><tr><th className="px-6 py-3">Action</th><th className="px-6 py-3">Détail</th><th className="px-6 py-3">Heure</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(stats.recent_logs || []).map((log, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${log.event_type === 'add_to_cart' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{log.event_type}</span></td>
                                            <td className="px-6 py-3 truncate max-w-xs">{log.page_url}</td>
                                            <td className="px-6 py-3 text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                  </>
                )}
            </div>
        )}

        {/* --- PRODUITS --- */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Catalogue</h2>
              <button onClick={toggleProductForm} className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-white transition-all ${showProductForm ? 'bg-slate-500 hover:bg-slate-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {showProductForm ? <><X size={18}/> Annuler</> : <><Plus size={18}/> {editingProduct ? 'Annuler modif' : 'Nouveau Produit'}</>}
              </button>
            </div>
            
            {showProductForm && (
               <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8 border-l-4 border-l-blue-600 animate-in zoom-in-95">
                 <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">{editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</h3>
                 </div>
                 <form onSubmit={handleSaveProduct} className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-4">
                        <input className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nom" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                        <div className="flex gap-2">
                            <input className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Prix" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                            <select className="border p-2.5 rounded-lg bg-white" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                                <option>Divers</option>
                                <option>Smartphone</option>
                                <option>Ordinateur</option>
                                <option>Audio</option>
                                <option>Mode</option>
                            </select>
                        </div>
                        <textarea className="border p-2.5 rounded-lg w-full h-24 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Description courte..." value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input className="border p-2.5 pl-10 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Image URL (https://...)" value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} />
                        </div>
                        {/* Preview */}
                        <div className="h-32 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                            {productForm.image_url ? (
                                <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.src='https://via.placeholder.com/300?text=Erreur+Image'} />
                            ) : <span className="text-slate-400 text-sm">Aperçu image</span>}
                        </div>
                        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                            {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
                        </button>
                    </div>
                 </form>
               </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group relative hover:shadow-md transition-all">
                        <div className="aspect-square bg-slate-100 relative overflow-hidden">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => e.target.src='https://via.placeholder.com/300'} />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditProductClick(product)} className="bg-white p-2 rounded-full text-blue-600 shadow-md hover:bg-blue-50 transition-colors" title="Modifier">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="bg-white p-2 rounded-full text-red-500 shadow-md hover:bg-red-50 transition-colors" title="Supprimer">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                {product.category}
                            </span>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                                <span className="font-bold text-blue-600">{product.price}€</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 h-8">{product.description || "Aucune description."}</p>
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
                    <h2 className="text-xl font-bold text-slate-800">Commandes</h2>
                    <button onClick={() => setShowOrderForm(!showOrderForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
                        {showOrderForm ? <><X size={18}/> Annuler</> : <><Plus size={18}/> Créer</>}
                    </button>
                </div>

                {showOrderForm && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6 animate-in zoom-in-95">
                    <form onSubmit={handleAddOrder} className="grid md:grid-cols-2 gap-4">
                      <input className="border p-2.5 rounded-lg" placeholder="Nom Client" value={orderForm.client} onChange={e => setOrderForm({...orderForm, client: e.target.value})} />
                      <input className="border p-2.5 rounded-lg" placeholder="Email" value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} />
                      <input className="border p-2.5 rounded-lg" placeholder="Montant" type="number" step="0.01" value={orderForm.amount} onChange={e => setOrderForm({...orderForm, amount: e.target.value})} />
                      <input className="border p-2.5 rounded-lg" placeholder="Produits (virgule)" value={orderForm.items} onChange={e => setOrderForm({...orderForm, items: e.target.value})} />
                      <input className="border p-2.5 rounded-lg col-span-2" placeholder="Adresse" value={orderForm.addressLine1} onChange={e => setOrderForm({...orderForm, addressLine1: e.target.value})} />
                      <input className="border p-2.5 rounded-lg" placeholder="CP" value={orderForm.postalCode} onChange={e => setOrderForm({...orderForm, postalCode: e.target.value})} />
                      <input className="border p-2.5 rounded-lg" placeholder="Ville" value={orderForm.city} onChange={e => setOrderForm({...orderForm, city: e.target.value})} />
                      <button type="submit" className="col-span-full bg-green-600 text-white font-bold py-3 rounded-lg">Confirmer</button>
                    </form>
                  </div>
                )}

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

const TabButton = ({ active, onClick, icon, children }) => (
    <button onClick={onClick} className={`flex items-center gap-2 pb-3 px-4 font-semibold text-sm transition-all whitespace-nowrap ${active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {icon} {children}
    </button>
);

const StatCard = ({ title, value, icon, color }) => {
    const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600' };
    return (<div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"><div className="flex justify-between items-start"><div><p className="text-sm font-medium text-slate-500">{title}</p><h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3></div><div className={`p-3 rounded-lg ${colors[color]||'bg-gray-50'}`}>{icon}</div></div></div>);
};

const TunnelStep = ({ value, label, sub, color }) => (
    <div className={`flex-1 p-4 rounded-lg w-full ${color}`}>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs uppercase font-semibold opacity-80">{label}</div>
        {sub && <div className="text-xs opacity-60 mt-1">{sub} conv.</div>}
    </div>
);

export default DashboardPage;