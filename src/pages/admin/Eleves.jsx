import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { eleveService } from '../../services/eleveService';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { STATUTS_ELEVE, STATUTS_PAIEMENT } from '../../utils/constants';
import {
  Search, Filter, Download, FileText,
  Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const Eleves = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eleves, setEleves]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);

  const statut    = searchParams.get('statut') || '';
  const classeId  = searchParams.get('classe_id') || '';
  const limit     = 15;

  const fetchEleves = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statut)   params.statut    = statut;
      if (classeId) params.classe_id = classeId;
      if (search)   params.search    = search;

      const data = await eleveService.getListe(params);
      setEleves(data.eleves);
      setTotal(data.total);
    } catch (err) {
      toast.error('Erreur lors du chargement des élèves');
    } finally {
      setLoading(false);
    }
  }, [page, statut, classeId, search]);

  useEffect(() => { fetchEleves(); }, [fetchEleves]);

  const handleStatut = async (id, newStatut) => {
    try {
      await eleveService.updateStatut(id, newStatut);
      toast.success(`Élève ${newStatut === 'actif' ? 'activé' : 'désactivé'}`);
      fetchEleves();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handlePDF = async (id) => {
    try {
      await eleveService.getPDF(id);
      toast.success('PDF téléchargé');
    } catch {
      toast.error('Erreur génération PDF');
    }
  };

  const handleExcel = async () => {
    try {
      await eleveService.exportExcel({ statut, classe_id: classeId });
      toast.success('Export Excel téléchargé');
    } catch {
      toast.error('Erreur export Excel');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <div className="space-y-4">

        {/* Filtres */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center justify-between">

            {/* Recherche */}
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtre statut */}
            <select
              value={statut}
              onChange={(e) => { setSearchParams({ statut: e.target.value }); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(STATUTS_ELEVE).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Export */}
            <Button variant="outline" size="sm" onClick={handleExcel}>
              <Download size={14} className="mr-1.5"/> Excel
            </Button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header tableau */}
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{total}</span> élève(s) trouvé(s)
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
            </div>
          ) : eleves.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Search size={32} className="mb-2 opacity-50"/>
              <p className="text-sm">Aucun élève trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Élève</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Classe</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Paiement</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {eleves.map((eleve) => (
                    <tr key={eleve.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={eleve.photo_url}
                            alt={eleve.nom}
                            className="w-8 h-8 rounded-full object-cover bg-gray-100"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${eleve.nom}&background=2563EB&color=fff`; }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{eleve.nom} {eleve.prenom}</p>
                            <p className="text-xs text-gray-400">{eleve.telephone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{eleve.classe_nom || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{eleve.parent_nom}</p>
                        <p className="text-xs text-gray-400">{eleve.parent_telephone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={eleve.statut}>
                          {STATUTS_ELEVE[eleve.statut] || eleve.statut}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={eleve.statut_paiement}>
                          {STATUTS_PAIEMENT[eleve.statut_paiement] || eleve.statut_paiement}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/admin/eleves/${eleve.id}`}>
                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Voir la fiche">
                              <Eye size={15}/>
                            </button>
                          </Link>
                          <button
                            onClick={() => handlePDF(eleve.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Télécharger PDF"
                          >
                            <FileText size={15}/>
                          </button>
                          {eleve.statut === 'en_attente' && (
                            <button
                              onClick={() => handleStatut(eleve.id, 'actif')}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                              title="Valider"
                            >
                              <CheckCircle size={15}/>
                            </button>
                          )}
                          {eleve.statut === 'actif' && (
                            <button
                              onClick={() => handleStatut(eleve.id, 'inactif')}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Désactiver"
                            >
                              <XCircle size={15}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {page} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={14}/>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Eleves;