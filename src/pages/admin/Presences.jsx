import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../services/api';
import {
   Filter, ChevronDown, ChevronUp,
  Calendar, CheckCircle, XCircle, Clock
} from 'lucide-react';

const Presences = () => {
  const [appels, setAppels]     = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail]     = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [filters, setFilters] = useState({
    classe_id  : '',
    date_debut : '',
    date_fin   : '',
    page       : 1,
  });
  const [total, setTotal] = useState(0);

 useEffect(() => { fetchAppels(); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAppels = async () => {
    setLoading(true);
    try {
      const params = { limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/appels', { params });
      setAppels(res.data.appels);
      setTotal(res.data.total);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppels(); }, [filters]);

  const handleExpand = async (appel) => {
    if (expanded === appel.id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(appel.id);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/appels/${appel.id}`);
      setDetail(res.data);
    } catch {
      toast.error('Erreur chargement détail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const statutIcon = (statut) => {
    if (statut === 'present') return <CheckCircle size={14} className="text-green-500"/>;
    if (statut === 'absent')  return <XCircle size={14} className="text-red-500"/>;
    return <Clock size={14} className="text-amber-500"/>;
  };

  const statutLabel = (statut) => {
    if (statut === 'present') return 'Présent';
    if (statut === 'absent')  return 'Absent';
    return 'Retard';
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">

        {/* En-tête */}
        <div>
          <h1 className="text-lg font-bold text-gray-800">Présences</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Historique des appels effectués par les enseignants
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-gray-400"/>
              <span className="text-sm text-gray-500">Filtrer :</span>
            </div>
            <select
              value={filters.classe_id}
              onChange={(e) => setFilters(f => ({ ...f, classe_id: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.date_debut}
              onChange={(e) => setFilters(f => ({ ...f, date_debut: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.date_fin}
              onChange={(e) => setFilters(f => ({ ...f, date_fin: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setFilters({ classe_id: '', date_debut: '', date_fin: '', page: 1 })}
              className="text-xs text-blue-600 hover:underline"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Total */}
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{total}</span> appel(s) trouvé(s)
        </p>

        {/* Liste appels */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : appels.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Aucun appel enregistré</p>
            <p className="text-xs mt-1">Les appels apparaîtront ici quand les enseignants utiliseront l'application mobile</p>
          </div>
        ) : (
          <div className="space-y-2">
            {appels.map((appel) => (
              <div key={appel.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Header appel */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleExpand(appel)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-blue-600"/>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {appel.classe_nom} — {appel.matiere_nom}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(appel.date_appel).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                        })} · {appel.enseignant_nom} {appel.enseignant_prenom}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={14}/> {appel.presents}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle size={14}/> {appel.absents}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Clock size={14}/> {appel.retards}
                      </span>
                    </div>
                    {expanded === appel.id
                      ? <ChevronUp size={16} className="text-gray-400"/>
                      : <ChevronDown size={16} className="text-gray-400"/>
                    }
                  </div>
                </div>

                {/* Détail présences */}
                {expanded === appel.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    {loadingDetail ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"/>
                      </div>
                    ) : detail ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {detail.presences.map((p) => (
                          <div key={p.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                            <img
                              src={p.photo_url}
                              alt={p.nom}
                              className="w-7 h-7 rounded-full object-cover bg-gray-100 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${p.nom}&background=2563EB&color=fff&size=64`;
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">
                                {p.nom} {p.prenom}
                              </p>
                              {p.motif && (
                                <p className="text-xs text-gray-400 truncate">{p.motif}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {statutIcon(p.statut)}
                              <span className={`text-xs font-medium ${
                                p.statut === 'present' ? 'text-green-600' :
                                p.statut === 'absent'  ? 'text-red-500'  : 'text-amber-500'
                              }`}>
                                {statutLabel(p.statut)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Presences;