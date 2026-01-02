import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, 
  Package, MapPin, Plus, Trash2, X, RefreshCw, AlertOctagon, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Gestion sécurisée de l'URL API
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // On reste sur les commandes pour voir le résultat
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Formulaire d'ajout
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    email: '',
    items: '',
    addressLine1: '',
    city: '',
    postalCode: ''
  });

  const fetchData = async () => {
    setLoading(true);
    
    // A. Récupération des Commandes
    try {
      const ordersRes = await fetch(`${API_URL}/orders`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (e) {
      console.error("Erreur connexion API Commandes:", e);
      toast.error("Impossible de charger les commandes");
    }

    // B. Récupération des Stats
    try {
      const statsRes = await fetch(`${API_URL}/analytics/stats`);
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (e) {
      console.warn("Pas de stats disponibles");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---
  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!formData.client || !formData.amount) return;

    const toastId = toast.loading("Création...");
    const itemsArray = formData.items.split(',').map(item => item.trim()).filter(i => i);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData.client,
          email: formData.email || 'client@email.com',
          amount: parseFloat(formData.amount),
          items: JSON.stringify(itemsArray),
          date: new Date().toISOString(),
          // Envoi de l'adresse complète structurée
          address: { 
            line1: formData.addressLine1 || '',
            city: formData.city || '',
            postal_code: formData.postalCode || '',
            country: 'France' 
          }
        })
      });

      if (!response.ok) throw new Error("Erreur serveur");
      toast.success("Commande ajoutée !", { id: toastId });
      setShowAddForm(false);
      setFormData({ client: '', amount: '', email: '', items: '', addressLine1: '', city: '', postalCode: '' });
      fetchData(); 

    } catch (err) {
      toast.error("Erreur: " + err.message, { id: toastId });
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    const toastId = toast.loading("Suppression...");
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Erreur serveur");
      toast.success("Supprimé", { id: toastId });
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      toast.error("Erreur: " + err.message, { id: toastId });
    }
  };

  // --- RENDER ---
  if (loading && !orders.length && !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500">Chargement du Dashboard...</p>
      </div>
    );
  }

  const summary = stats?.summary || { total_sales: 0, total_events: 0, breakdown: {} };
  const topProducts = stats?.summary?.top_products || {};
  const recentLogs = stats?.recent_logs || [];
  const maxProductCount = Math.max(...Object.values(topProducts), 1);

  // Calculs pour le Tunnel
  const views = summary.breakdown?.page_view || 0;
  const productViews = summary.breakdown?.view_item || 0;
  const addToCarts = summary.breakdown?.add_to_cart || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Empire Dashboard
              {API_URL.includes('localhost') && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">Localhost</span>
              )}
            </h1>
            <p className="text-slate-500">Vue d'ensemble de votre activité.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                <span className="text-slate-400 mr-2">CA Total</span>
                <span className="font-bold text-green-600 text-lg">
                  {summary.total_sales?.toLocaleString('fr-FR', {style:'currency', currency:'EUR'}) || '0 €'}
                </span>
             </div>
             <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Boutique
             </Link>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`pb-3 px-2 font-semibold text-sm transition-all ${activeTab === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Analytics & Tunnel
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-2 font-semibold text-sm transition-all ${activeTab === 'orders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Commandes ({orders.length})
            </button>
        </div>

        {/* --- CONTENU : ANALYTICS --- */}
        {activeTab === 'analytics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!stats ? (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-center text-yellow-800">
                    <AlertOctagon className="mx-auto mb-2" />
                    Pas de données analytiques.
                  </div>
                ) : (
                  <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Vues Totales" value={summary.total_events} icon={<BarChart3 size={24} />} color="blue" />
                        <StatCard title="Intérêt Produits" value={productViews} icon={<MousePointer size={24} />} color="purple" />
                        <StatCard title="Ajouts Panier" value={addToCarts} icon={<ShoppingBag size={24} />} color="green" />
                        <StatCard title="Visiteurs Uniques" value={summary.breakdown?.page_view || 0} icon={<Users size={24} />} color="orange" />
                    </div>

                    {/* Tunnel de Vente Visuel */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Tunnel de Conversion</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                            <div className="flex-1 p-4 bg-slate-50 rounded-lg w-full">
                                <div className="text-2xl font-bold text-slate-700">{views}</div>
                                <div className="text-xs text-slate-500 uppercase font-semibold">Vues Site</div>
                            </div>
                            <ArrowRight className="text-slate-300 hidden md:block" />
                            <div className="flex-1 p-4 bg-purple-50 rounded-lg w-full">
                                <div className="text-2xl font-bold text-purple-700">{productViews}</div>
                                <div className="text-xs text-purple-600 uppercase font-semibold">Produits Vus</div>
                                <div className="text-xs text-slate-400 mt-1">{views > 0 ? ((productViews/views)*100).toFixed(1) : 0}% conv.</div>
                            </div>
                            <ArrowRight className="text-slate-300 hidden md:block" />
                            <div className="flex-1 p-4 bg-green-50 rounded-lg w-full">
                                <div className="text-2xl font-bold text-green-700">{addToCarts}</div>
                                <div className="text-xs text-green-600 uppercase font-semibold">Ajouts Panier</div>
                                <div className="text-xs text-slate-400 mt-1">{productViews > 0 ? ((addToCarts/productViews)*100).toFixed(1) : 0}% conv.</div>
                            </div>
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
                                {Object.entries(topProducts).map(([name, count], index) => (
                                    <div key={name}>
                                        <div className="flex justify-between items-center text-sm mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                                                <span className="font-medium text-slate-700 truncate max-w-[150px]">{name}</span>
                                            </div>
                                            <span className="text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">{count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(count / maxProductCount) * 100}%` }}></div>
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
                                        {recentLogs.map((log, i) => (
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

        {/* --- CONTENU : COMMANDES --- */}
        {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Liste des commandes</h2>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                    >
                        {showAddForm ? <><X size={18}/> Annuler</> : <><Plus size={18}/> Ajouter manuellement</>}
                    </button>
                </div>

                {showAddForm && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6 animate-in zoom-in-95">
                    <h3 className="font-bold text-lg mb-4">Nouvelle Commande</h3>
                    <form onSubmit={handleAddOrder} className="grid md:grid-cols-2 gap-4">
                      {/* Champs Client */}
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Nom du Client" 
                        value={formData.client} 
                        onChange={e => setFormData({...formData, client: e.target.value})} 
                      />
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                      />
                      
                      {/* Champs Montant & Produits */}
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Montant" 
                        type="number" step="0.01" 
                        value={formData.amount} 
                        onChange={e => setFormData({...formData, amount: e.target.value})} 
                      />
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Produits (virgule)" 
                        value={formData.items} 
                        onChange={e => setFormData({...formData, items: e.target.value})} 
                      />

                      {/* Nouveaux Champs Adresse */}
                      <input 
                        className="border p-2 rounded col-span-2" 
                        placeholder="Adresse (Rue, numéro...)" 
                        value={formData.addressLine1} 
                        onChange={e => setFormData({...formData, addressLine1: e.target.value})} 
                      />
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Code Postal" 
                        value={formData.postalCode} 
                        onChange={e => setFormData({...formData, postalCode: e.target.value})} 
                      />
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Ville" 
                        value={formData.city} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                      />

                      <button type="submit" className="col-span-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">Confirmer</button>
                    </form>
                  </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Aucune commande.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            let parsedItems = [];
                            try {
                                parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                if (!Array.isArray(parsedItems)) parsedItems = [order.items];
                            } catch (e) { parsedItems = [order.items || "-"]; }

                            // CORRECTION AFFICHAGE ADRESSE
                            // On vérifie s'il y a vraiment du contenu dans l'objet adresse
                            const hasAddress = order.address && (order.address.line1 || order.address.city);

                            return (
                                <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                        <div>
                                            <h3 className="font-bold text-slate-900">Commande #{order.id}</h3>
                                            <p className="text-slate-500 text-sm">{new Date(order.date).toLocaleDateString()} • {order.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-slate-900">{Number(order.amount).toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}</p>
                                            <button onClick={() => handleDeleteOrder(order.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                                        <div>
                                            <p className="font-semibold mb-1"><Package size={14} className="inline mr-1"/> Produits:</p>
                                            <ul className="list-disc pl-5">{parsedItems.map((it, i) => <li key={i}>{it}</li>)}</ul>
                                        </div>
                                        <div>
                                            <p className="font-semibold mb-1"><MapPin size={14} className="inline mr-1"/> Livraison:</p>
                                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                {hasAddress ? (
                                                    <>
                                                        <p className="font-medium text-slate-800">{order.address.line1}</p>
                                                        <p>{order.address.postal_code} {order.address.city}</p>
                                                        <p className="uppercase text-xs text-slate-500 mt-1">{order.address.country}</p>
                                                    </>
                                                ) : <span className="italic text-slate-400">Adresse non renseignée</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = { blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600', green: 'bg-green-50 text-green-600', orange: 'bg-orange-50 text-orange-600' };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start">
        <div><p className="text-sm font-medium text-slate-500">{title}</p><h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3></div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default DashboardPage;