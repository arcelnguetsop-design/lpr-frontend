import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import {
  GraduationCap, CheckCircle, XCircle,
  KeyRound, Search, RefreshCw
} from 'lucide-react';

const STATUTS = {
  en_attente : { label: 'En attente', variant: 'en_attente' },
  actif      : { label: 'Actif',      variant: 'actif' },
  desactive  : { label: 'Désactivé',  variant: 'archive' },
};

const Enseignants = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statut, setStatut]           = useState('');
  const [actionId, setActionId]       = useState(null);
  const [showReset, setShowReset]     = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting]     = useState(false);

  const fetchEnseignants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statut) params.statut = statut;
      const res = await api.get('/enseignants', { params });
      setEnseignants(res.data.enseignants);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnseignants(); }, [statut]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatut = async (id, newStatut) => {
    setActionId(id);
    try {
      await api.put(`/enseignants/${id}/statut`, { statut: newStatut });
      toast.success(
        newStatut === 'actif' ? 'Compte activé ✓' :
        newStatut === 'desactive' ? 'Compte désactivé' : 'Statut mis à jour'
      );
      fetchEnseignants();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur serveur');
    } finally {
      setActionId(null);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Mot de passe minimum 6 caractères');
      return;
    }
    setResetting(true);
    try {
      await api.put(`/enseignants/${showReset.id}/reset-password`, {
        new_password: newPassword,
      });
      toast.success(`Mot de passe réinitialisé pour ${showReset.nom}`);
      setShowReset(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur serveur');
    } finally {
      setResetting(false);
    }
  };

  const filtered = enseignants.filter(e =>
    `${e.nom} ${e.prenom} ${e.email} ${e.telephone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const counts = {
    total      : enseignants.length,
    actif      : enseignants.filter(e => e.statut === 'actif').length,
    en_attente : enseignants.filter(e => e.statut === 'en_attente').length,
    desactive  : enseignants.filter(e => e.statut === 'desactive').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">

        {/* En-tête */}
        <div>
          <h1 className="text-lg font-bold text-gray-800">Enseignants</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Validez les comptes et gérez les accès des enseignants
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',      value: counts.total,      color: 'text-gray-700',  bg: 'bg-gray-50'   },
            { label: 'Actifs',     value: counts.actif,      color: 'text-green-600', bg: 'bg-green-50'  },
            { label: 'En attente', value: counts.en_attente, color: 'text-amber-600', bg: 'bg-amber-50'  },
            { label: 'Désactivés', value: counts.desactive,  color: 'text-red-500',   bg: 'bg-red-50'    },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Alerte comptes en attente */}
        {counts.en_attente > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <GraduationCap size={20} className="text-amber-600 flex-shrink-0"/>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {counts.en_attente} compte(s) enseignant en attente de validation
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Vérifiez que ce sont bien des enseignants du centre avant d'activer
              </p>
            </div>
            <button
              onClick={() => setStatut('en_attente')}
              className="text-xs font-medium text-amber-700 hover:underline"
            >
              Voir →
            </button>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input
              type="text"
              placeholder="Rechercher un enseignant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="actif">Actifs</option>
            <option value="desactive">Désactivés</option>
          </select>
          <button
            onClick={fetchEnseignants}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={16} className="text-gray-500"/>
          </button>
        </div>

        {/* Liste enseignants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <GraduationCap size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="text-sm">Aucun enseignant trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((ens) => (
                <div key={ens.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {ens.nom?.charAt(0)}{ens.prenom?.charAt(0)}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {ens.nom} {ens.prenom}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-400 truncate">{ens.email}</p>
                      <span className="text-gray-200">•</span>
                      <p className="text-xs text-gray-400">{ens.telephone}</p>
                    </div>
                  </div>

                  {/* Statut */}
                  <Badge variant={STATUTS[ens.statut]?.variant || 'default'}>
                    {STATUTS[ens.statut]?.label || ens.statut}
                  </Badge>

                  {/* Date inscription */}
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {new Date(ens.created_at).toLocaleDateString('fr-FR')}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {ens.statut === 'en_attente' && (
                      <button
                        onClick={() => handleStatut(ens.id, 'actif')}
                        disabled={actionId === ens.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                        title="Valider ce compte"
                      >
                        <CheckCircle size={13}/> Valider
                      </button>
                    )}
                    {ens.statut === 'actif' && (
                      <button
                        onClick={() => handleStatut(ens.id, 'desactive')}
                        disabled={actionId === ens.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                        title="Désactiver ce compte"
                      >
                        <XCircle size={13}/> Désactiver
                      </button>
                    )}
                    {ens.statut === 'desactive' && (
                      <button
                        onClick={() => handleStatut(ens.id, 'actif')}
                        disabled={actionId === ens.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <CheckCircle size={13}/> Réactiver
                      </button>
                    )}
                    <button
                      onClick={() => { setShowReset(ens); setNewPassword(''); }}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                      title="Réinitialiser le mot de passe"
                    >
                      <KeyRound size={15}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MODAL RESET MOT DE PASSE ── */}
        {showReset && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Réinitialiser le mot de passe</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {showReset.nom} {showReset.prenom} — {showReset.email}
                </p>
              </div>
              <div className="p-5">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Communiquez ce mot de passe à l'enseignant par WhatsApp ou SMS
                </p>
              </div>
              <div className="p-5 border-t border-gray-100 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowReset(null)}>
                  Annuler
                </Button>
                <Button className="flex-1" loading={resetting} onClick={handleResetPassword}>
                  <KeyRound size={14} className="mr-1.5"/> Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Enseignants;