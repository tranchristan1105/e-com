import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, 
  Package, MapPin, Plus, Trash2, X, RefreshCw, AlertOctagon 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Gestion sécurisée de l'URL API
// Cela permet de basculer automatiquement entre localhost et la prod (VITE_API_URL)
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
  const [activeTab, setActiveTab] = useState('orders'); // On commence par les commandes pour vérifier
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Formulaire d'ajout
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    email: '',
    items: '' // On attendra une liste séparée par des virgules
  });

  // --- 1. CHARGEMENT DES DONNÉES (Séparé pour plus de robustesse) ---
  const fetchData = async () => {
    setLoading(true);
    
    // A. Récupération des Commandes
    try {
      const ordersRes = await fetch(`${API_URL}/orders`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        // Sécurité si l'API renvoie un objet au lieu d'un tableau
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        console.error("Erreur chargement commandes");
      }
    } catch (e) {
      console.error("Erreur connexion API Commandes:", e);
      toast.error("Impossible de charger les commandes");
    }

    // B. Récupération des Stats (Indépendant)
    try {
      const statsRes = await fetch(`${API_URL}/analytics/stats`);
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (e) {
      console.warn("Pas de stats disponibles ou erreur API stats");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. ACTIONS (AJOUT / SUPPRESSION) ---
  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!formData.client || !formData.amount) return;

    const toastId = toast.loading("Création de la commande...");

    // Conversion des items (texte) en tableau JSON pour correspondre à votre format
    const itemsArray = formData.items.split(',').map(item => item.trim()).filter(i => i);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData.client,
          email: formData.email || 'client@email.com',
          amount: parseFloat(formData.amount),
          items: JSON.stringify(itemsArray), // On stocke en string JSON comme attendu par votre affichage
          date: new Date().toISOString(),
          address: { city: 'Paris', country: 'France' } // Données par défaut pour l'exemple
        })
      });

      if (!response.ok) throw new Error("Erreur serveur");

      toast.success("Commande ajoutée !", { id: toastId });
      setShowAddForm(false);
      setFormData({ client: '', amount: '', email: '', items: '' });
      fetchData(); // Recharger la liste

    } catch (err) {
      toast.error("Erreur création: " + err.message, { id: toastId });
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Supprimer cette commande définitivement ?")) return;
    
    const toastId = toast.loading("Suppression...");
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Impossible de supprimer");

      toast.success("Commande supprimée", { id: toastId });
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
        <p className="text-slate-500">Connexion au QG...</p>
      </div>
    );
  }

  // Valeurs par défaut pour éviter les crashs si stats est null
  const summary = stats?.summary || { total_sales: 0, total_events: 0, breakdown: {} };
  const topProducts = stats?.summary?.top_products || {};
  const recentLogs = stats?.recent_logs || [];
  const maxProductCount = Math.max(...Object.values(topProducts), 1);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Empire Dashboard
              {API_URL.includes('localhost') && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                  Localhost
                </span>
              )}
            </h1>
            <p className="text-slate-500">Vue d'ensemble de votre activité e-commerce.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                <span className="text-slate-400 mr-2">Chiffre d'Affaires</span>
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
                Analytics & Trafic
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
                    Pas de données analytiques disponibles pour le moment.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Vues Totales" value={summary.total_events} icon={<BarChart3 size={24} />} color="blue" />
                        <StatCard title="Intérêt Produits" value={summary.breakdown?.view_item || 0} icon={<MousePointer size={24} />} color="purple" />
                        <StatCard title="Ajouts Panier" value={summary.breakdown?.add_to_cart || 0} icon={<ShoppingBag size={24} />} color="green" />
                        <StatCard title="Vues Accueil" value={summary.breakdown?.page_view || 0} icon={<Users size={24} />} color="orange" />
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
                
                {/* Barre d'outils Commandes */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Liste des commandes</h2>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                    >
                        {showAddForm ? <><X size={18}/> Annuler</> : <><Plus size={18}/> Ajouter manuellement</>}
                    </button>
                </div>

                {/* Formulaire Ajout */}
                {showAddForm && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6 animate-in zoom-in-95">
                    <h3 className="font-bold text-lg mb-4">Nouvelle Commande (Test)</h3>
                    <form onSubmit={handleAddOrder} className="grid md:grid-cols-2 gap-4">
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
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Montant (ex: 49.99)" 
                        type="number" step="0.01"
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                      />
                      <input 
                        className="border p-2 rounded" 
                        placeholder="Produits (séparés par virgule)" 
                        value={formData.items}
                        onChange={e => setFormData({...formData, items: e.target.value})}
                      />
                      <button type="submit" className="col-span-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">
                        Confirmer l'ajout
                      </button>
                    </form>
                  </div>
                )}

                {/* Liste Commandes */}
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Aucune commande pour le moment.</p>
                        <p className="text-sm text-slate-400">Patience, l'empire se construit brique par brique.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            // Parsing sécurisé des items
                            let parsedItems = [];
                            try {
                                parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                if (!Array.isArray(parsedItems)) parsedItems = [order.items];
                            } catch (e) {
                                parsedItems = [order.items || "Détails indisponibles"];
                            }

                            return (
                                <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-100 gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Payé</span>
                                                <h3 className="font-bold text-slate-900 text-lg">Commande #{order.id}</h3>
                                            </div>
                                            <p className="text-slate-500 text-sm flex items-center gap-2">
                                                <span>{order.date ? new Date(order.date).toLocaleString() : 'Date inconnue'}</span>
                                                <span>•</span>
                                                <span className="font-medium text-slate-700">{order.email}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-extrabold text-slate-900">
                                                    {Number(order.amount).toLocaleString('fr-FR', {style:'currency', currency:'EUR'})}
                                                </p>
                                                <p className="text-xs text-slate-400">Via Stripe</p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title="Supprimer la commande"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Produits */}
                                        <div>
                                            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Package size={16} /> Produits</h4>
                                            <ul className="space-y-2">
                                                {parsedItems.map((item, idx) => (
                                                    <li key={idx} className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded border border-slate-100">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        {/* Livraison */}
                                        <div>
                                            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><MapPin size={16} /> Livraison</h4>
                                            <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded border border-slate-100">
                                                <p className="font-bold">{order.customer}</p>
                                                {order.address && (
                                                    <>
                                                        <p>{order.address.line1}</p>
                                                        <p>{order.address.postal_code} {order.address.city}</p>
                                                        <p>{order.address.country}</p>
                                                    </>
                                                )}
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