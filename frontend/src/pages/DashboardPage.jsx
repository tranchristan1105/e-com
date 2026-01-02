import React, { useEffect, useState } from 'react';
import { BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, ArrowDown, Package, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [orders, setOrders] = useState([]); // <--- NOUVEAU
  const [activeTab, setActiveTab] = useState('analytics'); // analytics | orders
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
        const [statsRes, ordersRes] = await Promise.all([
            fetch(`${API_URL}/analytics/stats`),
            fetch(`${API_URL}/orders`)
        ]);
        
        setStats(await statsRes.json());
        setOrders(await ordersRes.json());
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Update toutes les 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement du QG...</div>;
  if (!stats) return <div className="p-10 text-center text-red-500">Erreur Connexion</div>;

  const { summary, recent_logs } = stats;
  const maxProductCount = Math.max(...Object.values(summary.top_products || {0:0}), 1);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Empire Dashboard</h1>
            <p className="text-slate-500">Vue d'ensemble de votre activité e-commerce.</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                <span className="text-slate-400 mr-2">Chiffre d'Affaires</span>
                <span className="font-bold text-green-600 text-lg">{summary.total_sales || 0} €</span>
             </div>
             <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Retour Boutique
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

        {/* CONTENU - ONGLET ANALYTICS */}
        {activeTab === 'analytics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Vues Totales" value={summary.total_events} icon={<BarChart3 size={24} />} color="blue" />
                    <StatCard title="Intérêt Produits" value={summary.breakdown.view_item || 0} icon={<MousePointer size={24} />} color="purple" />
                    <StatCard title="Ajouts Panier" value={summary.breakdown.add_to_cart || 0} icon={<ShoppingBag size={24} />} color="green" />
                    <StatCard title="Vues Accueil" value={summary.breakdown.page_view || 0} icon={<Users size={24} />} color="orange" />
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
                                    {recent_logs.map((log, i) => (
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
            </div>
        )}

        {/* CONTENU - ONGLET COMMANDES (NOUVEAU) */}
        {activeTab === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Aucune commande pour le moment.</p>
                        <p className="text-sm text-slate-400">Patience, l'empire se construit brique par brique.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-100 gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Payé</span>
                                            <h3 className="font-bold text-slate-900 text-lg">Commande #{order.id}</h3>
                                        </div>
                                        <p className="text-slate-500 text-sm flex items-center gap-2">
                                            <span>{new Date(order.date).toLocaleString()}</span>
                                            <span>•</span>
                                            <span className="font-medium text-slate-700">{order.email}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-extrabold text-slate-900">{order.amount} €</p>
                                        <p className="text-xs text-slate-400">Via Stripe</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Produits */}
                                    <div>
                                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Package size={16} /> Produits</h4>
                                        <ul className="space-y-2">
                                            {JSON.parse(order.items || "[]").map((item, idx) => (
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
                        ))}
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