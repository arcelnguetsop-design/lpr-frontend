import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { Search, FileText, Download, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Bulletins = () => {
  const [classes, setClasses]     = useState([]);
  const [eleves, setEleves]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('1');
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null);
  const [bulletin, setBulletin]   = useState(null);
  const [loadingBulletin, setLoadingBulletin] = useState(false);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.classes)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedClasse) { setEleves([]); return; }
    setLoading(true);
    api.get('/eleves/liste', { params: { classe_id: selectedClasse, statut: 'actif', limit: 100 } })
      .then(r => setEleves(r.data.eleves))
      .catch(() => toast.error('Erreur chargement élèves'))
      .finally(() => setLoading(false));
  }, [selectedClasse]);

  const handleViewBulletin = async (eleveId) => {
    if (expanded === eleveId) { setExpanded(null); setBulletin(null); return; }
    setExpanded(eleveId);
    setLoadingBulletin(true);
    try {
      const res = await api.get(`/notes/eleves/${eleveId}/bulletin`, {
        params: { trimestre: selectedTrimestre }
      });
      setBulletin(res.data);
    } catch {
      toast.error('Erreur chargement bulletin');
    } finally {
      setLoadingBulletin(false);
    }
  };

  const getMentionColor = (moyenne) => {
    if (!moyenne) return 'text-gray-400';
    const m = parseFloat(moyenne);
    if (m >= 16) return 'text-green-600';
    if (m >= 14) return 'text-blue-600';
    if (m >= 12) return 'text-indigo-600';
    if (m >= 10) return 'text-amber-600';
    return 'text-red-500';
  };

  const getMention = (moyenne) => {
    if (!moyenne) return '—';
    const m = parseFloat(moyenne);
    if (m >= 16) return 'Très bien';
    if (m >= 14) return 'Bien';
    if (m >= 12) return 'Assez bien';
    if (m >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const filtered = eleves.filter(e =>
    `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">

        {/* En-tête */}
        <div>
          <h1 className="text-lg font-bold text-gray-800">Bulletins</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Consultez les bulletins de notes par classe et par trimestre
          </p>
        </div>

        {/* Sélecteurs */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedClasse}
              onChange={(e) => { setSelectedClasse(e.target.value); setExpanded(null); setBulletin(null); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choisir une classe</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>

            <select
              value={selectedTrimestre}
              onChange={(e) => { setSelectedTrimestre(e.target.value); setExpanded(null); setBulletin(null); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">Trimestre 1</option>
              <option value="2">Trimestre 2</option>
              <option value="3">Trimestre 3</option>
            </select>

            {selectedClasse && (
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Guide */}
        {!selectedClasse && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Sélectionnez une classe pour voir les bulletins</p>
          </div>
        )}

        {/* Liste élèves */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : selectedClasse && (
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">Aucun élève dans cette classe</p>
              </div>
            ) : filtered.map((eleve) => (
              <div key={eleve.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Header élève */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleViewBulletin(eleve.id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={eleve.photo_url}
                      alt={eleve.nom}
                      className="w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${eleve.nom}&background=2563EB&color=fff&size=64`;
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-800">{eleve.nom} {eleve.prenom}</p>
                      <p className="text-xs text-gray-400">{eleve.classe_nom}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {expanded === eleve.id && bulletin && (
                      <span className={`text-sm font-bold ${getMentionColor(bulletin.moyenne_generale)}`}>
                        {bulletin.moyenne_generale ? `${bulletin.moyenne_generale}/20` : '—'}
                      </span>
                    )}
                    {expanded === eleve.id
                      ? <ChevronUp size={16} className="text-gray-400"/>
                      : <ChevronDown size={16} className="text-gray-400"/>
                    }
                  </div>
                </div>

                {/* Bulletin détaillé */}
                {expanded === eleve.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    {loadingBulletin ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"/>
                      </div>
                    ) : !bulletin ? null : (
                      <div>
                        {/* Moyenne générale */}
                        <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-between border border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500">Moyenne générale — Trimestre {selectedTrimestre}</p>
                            <p className={`text-3xl font-bold mt-1 ${getMentionColor(bulletin.moyenne_generale)}`}>
                              {bulletin.moyenne_generale ? `${bulletin.moyenne_generale}/20` : '—'}
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${getMentionColor(bulletin.moyenne_generale)}`}>
                              {getMention(bulletin.moyenne_generale)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{bulletin.eleve?.classe_nom}</p>
                            <p className="text-xs text-gray-400 mt-1">{bulletin.eleve?.annee_scolaire}</p>
                          </div>
                        </div>

                        {/* Tableau des matières */}
                        {bulletin.matieres.length === 0 ? (
                          <p className="text-center text-xs text-gray-400 py-4">
                            Aucune note enregistrée pour ce trimestre
                          </p>
                        ) : (
                          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Matière</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Coef.</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Notes</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Moyenne</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Mention</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {bulletin.matieres.map((mat, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-700">{mat.matiere}</td>
                                    <td className="px-4 py-3 text-center text-gray-500">{mat.coefficient}</td>
                                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                                      {mat.notes.length > 0 ? mat.notes.join(' / ') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`font-bold ${getMentionColor(mat.moyenne)}`}>
                                        {mat.moyenne ? `${mat.moyenne}/20` : '—'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`text-xs font-medium ${getMentionColor(mat.moyenne)}`}>
                                        {getMention(mat.moyenne)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
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

export default Bulletins;