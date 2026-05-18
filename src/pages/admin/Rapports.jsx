import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';
import {
  BarChart3, Users, UserCheck, CreditCard,
  TrendingUp, BookOpen, Download
} from 'lucide-react';

const StatBox = ({ title, value, subtitle, color, bg, icon: Icon }) => (
  <div className={`${bg} rounded-xl p-4 border border-gray-100`}>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-medium text-gray-500">{title}</p>
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon size={16} className={color}/>
      </div>
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

const Rapports = () => {
  const [stats, setStats]         = useState(null);
  const [classes, setClasses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('inscriptions');

  useEffect(() => {
    Promise.all([
      api.get('/eleves/stats'),
      api.get('/classes'),
    ]).then(([statsRes, classesRes]) => {
      setStats(statsRes.data);
      setClasses(classesRes.data.classes);
    }).catch(() => toast.error('Erreur chargement'))
    .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'inscriptions', label: 'Inscriptions', icon: Users },
    { id: 'classes',      label: 'Classes',      icon: BookOpen },
  ];

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/eleves/export/excel', { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `rapport_lpr_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Rapport Excel téléchargé');
    } catch {
      toast.error('Erreur export');
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Rapports & Statistiques</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Vue globale du centre — Année scolaire {stats?.annee_scolaire || '2025-2026'}
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={15}/> Exporter Excel
          </button>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBox
            title="Élèves actifs"
            value={stats?.eleves?.actifs}
            subtitle="Cette année"
            color="text-green-600"
            bg="bg-green-50"
            icon={UserCheck}
          />
          <StatBox
            title="En attente"
            value={stats?.eleves?.en_attente}
            subtitle="À valider"
            color="text-amber-600"
            bg="bg-amber-50"
            icon={Users}
          />
          <StatBox
            title="Paiements en attente"
            value={stats?.eleves?.paiements_en_attente}
            subtitle="À encaisser"
            color="text-red-500"
            bg="bg-red-50"
            icon={CreditCard}
          />
          <StatBox
            title="Total classes"
            value={stats?.classes}
            subtitle="Actives"
            color="text-blue-600"
            bg="bg-blue-50"
            icon={BookOpen}
          />
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={14}/>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Onglet Inscriptions ── */}
        {activeTab === 'inscriptions' && (
          <div className="space-y-4">

            {/* Répartition par statut */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-600"/>
                Répartition par statut
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Élèves actifs',     value: stats?.eleves?.actifs || 0,             color: 'bg-green-500',  total: stats?.eleves?.actifs + stats?.eleves?.en_attente + stats?.eleves?.inactifs || 1 },
                  { label: 'En attente',         value: stats?.eleves?.en_attente || 0,         color: 'bg-amber-500',  total: stats?.eleves?.actifs + stats?.eleves?.en_attente + stats?.eleves?.inactifs || 1 },
                  { label: 'Inactifs',           value: stats?.eleves?.inactifs || 0,           color: 'bg-gray-400',   total: stats?.eleves?.actifs + stats?.eleves?.en_attente + stats?.eleves?.inactifs || 1 },
                  { label: 'Paiements en attente', value: stats?.eleves?.paiements_en_attente || 0, color: 'bg-red-400', total: stats?.eleves?.actifs || 1 },
                ].map(({ label, value, color, total }) => {
                  const pct = Math.round((value / total) * 100) || 0;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{label}</span>
                        <span className="text-sm font-semibold text-gray-800">{value} <span className="text-xs text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions recommandées */}
            {(stats?.eleves?.en_attente > 0 || stats?.eleves?.paiements_en_attente > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <TrendingUp size={15}/> Actions recommandées
                </p>
                <ul className="space-y-1.5 text-xs text-amber-700">
                  {stats?.eleves?.en_attente > 0 && (
                    <li>• {stats.eleves.en_attente} inscription(s) en attente de validation</li>
                  )}
                  {stats?.eleves?.paiements_en_attente > 0 && (
                    <li>• {stats.eleves.paiements_en_attente} paiement(s) en attente de confirmation</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Onglet Classes ── */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Effectifs par classe</h3>
            </div>
            {classes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">Aucune classe</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <BookOpen size={14} className="text-blue-600"/>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{cls.nom}</p>
                        <p className="text-xs text-gray-400">{cls.niveau} {cls.examen_prepare ? `— ${cls.examen_prepare}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{cls.total_eleves || 0}</p>
                        <p className="text-xs text-gray-400">élève(s)</p>
                      </div>
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(((cls.total_eleves || 0) / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Rapports;