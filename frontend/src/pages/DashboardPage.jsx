import React, { useEffect, useState } from 'react';
import { BarChart3, Users, MousePointer, ShoppingBag, ArrowLeft, Trophy, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = "http://localhost:8000/api/v1";

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    fetch(`${API_URL}/analytics/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement des données...</div>;
  if (!stats) return <div className="p-10 text-center text-red-500">Erreur de chargement API</div>;

  const { summary, recent_logs } = stats;
  const maxProductCount = Math.max(...Object.values(summary.top_products || {0:0}), 1);

  // --- CALCULS DU TUNNEL ---
  const funnel = summary.funnel || { "1_visitors": 0, "2_interested": 0, "3_converted": 0 };
  const visitors = funnel["1_visitors"];
  const interested = funnel["2_interested"];
  const converted = funnel["3_converted"];

  // Taux de conversion (en %)
  const conversionRate1 = visitors > 0 ? Math.round((interested / visitors) * 100) : 0;
  const conversionRate2 = interested > 0 ? Math.round((converted / interested) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Analytics</h1>
            <p className="text-slate-500">Suivi en temps réel de l'activité utilisateur</p>
          </div>
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft size={20} className="mr-2" /> Retour au site
          </Link>
        </div>

        {/* --- TUNNEL DE VENTE (CORRIGÉ & ALIGNÉ) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <Users className="text-blue-500" />
                Tunnel de Conversion
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* ÉTAPE 1 : VISITEURS */}
                <div className="flex-1 w-full text-center p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 relative group hover:border-blue-300 transition-all">
                    <div className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-2">Visiteurs (Accueil)</div>
                    <div className="text-4xl font-extrabold text-blue-700">{visitors}</div>
                    <div className="text-xs text-blue-400 mt-1">Personnes uniques</div>
                </div>

                {/* FLÈCHE 1 */}
                <div className="flex flex-col items-center justify-center shrink-0 z-10">
                    <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 mb-2 shadow-sm whitespace-nowrap">
                        {conversionRate1}% retention
                    </div>
                    {/* Rotation : Pointe vers le bas sur mobile (0deg), vers la droite sur PC (-90deg) */}
                    <ArrowDown className="text-slate-300 rotate-0 md:-rotate-90" size={32} />
                </div>

                {/* ÉTAPE 2 : INTÉRESSÉS */}
                <div className="flex-1 w-full text-center p-6 bg-purple-50 rounded-2xl border-2 border-purple-100 relative group hover:border-purple-300 transition-all">
                    <div className="text-sm font-bold text-purple-400 uppercase tracking-wide mb-2">Intéressés (Produits)</div>
                    <div className="text-4xl font-extrabold text-purple-700">{interested}</div>
                    <div className="text-xs text-purple-400 mt-1">Clics sur fiche produit</div>
                </div>

                {/* FLÈCHE 2 */}
                <div className="flex flex-col items-center justify-center shrink-0 z-10">
                    <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500 mb-2 shadow-sm whitespace-nowrap">
                        {conversionRate2}% conversion
                    </div>
                    <ArrowDown className="text-slate-300 rotate-0 md:-rotate-90" size={32} />
                </div>

                {/* ÉTAPE 3 : CONVERTIS */}
                <div className="flex-1 w-full text-center p-6 bg-green-50 rounded-2xl border-2 border-green-100 relative group hover:border-green-300 transition-all shadow-lg shadow-green-100/50">
                    <div className="text-sm font-bold text-green-500 uppercase tracking-wide mb-2">Convertis (Panier)</div>
                    <div className="text-5xl font-extrabold text-green-700">{converted}</div>
                    <div className="text-xs text-green-500 mt-1">Futurs clients</div>
                </div>

            </div>
        </div>

        {/* RESTE DU DASHBOARD (KPIs + Logs) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Interactions" value={summary.total_events} icon={<BarChart3 size={24} />} color="blue" />
          <StatCard title="Vues Produits" value={summary.breakdown.view_item || 0} icon={<MousePointer size={24} />} color="purple" />
          <StatCard title="Ajouts Panier" value={summary.breakdown.add_to_cart || 0} icon={<ShoppingBag size={24} />} color="green" />
          <StatCard title="Vues Accueil" value={summary.breakdown.page_view || 0} icon={<Users size={24} />} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
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
                                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                                        index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                        index === 1 ? 'bg-slate-200 text-slate-700' : 'text-slate-400'
                                    }`}>{index + 1}</span>
                                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{name}</span>
                                </div>
                                <span className="text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded">{count} vues</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${index === 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                    style={{ width: `${(count / maxProductCount) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Activités Récentes</h2>
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium animate-pulse">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 font-semibold">
                        <tr>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3">Page / Produit</th>
                        <th className="px-6 py-3">Heure</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {recent_logs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                log.event_type === 'add_to_cart' ? 'bg-green-100 text-green-800' :
                                log.event_type === 'view_item' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100'
                            }`}>
                                {log.event_type === 'view_item' ? 'Vue Produit' : 
                                 log.event_type === 'add_to_cart' ? 'Ajout Panier' : 'Visite'}
                            </span>
                            </td>
                            <td className="px-6 py-3 text-slate-600 truncate max-w-xs font-medium">
                                {log.page_url.replace('/product/', 'Produit #')}
                            </td>
                            <td className="px-6 py-3 text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default DashboardPage;