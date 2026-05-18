import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { anneeScolaireService } from '../../services/anneeScolaireService';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import {
  CalendarDays, Plus, CheckCircle, Users,
  BookOpen, Clock, X, AlertTriangle
} from 'lucide-react';

const AnneesScolaires = () => {
  const [annees, setAnnees]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [libelle, setLibelle]       = useState('');
  const [creating, setCreating]     = useState(false);
  const [activating, setActivating] = useState(false);

  const fetchAnnees = async () => {
    setLoading(true);
    try {
      const data = await anneeScolaireService.getAll();
      setAnnees(data.annees);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnees(); }, []);

  // Génération automatique du libellé suivant
  const getNextLibelle = () => {
    if (annees.length === 0) {
      const y = new Date().getFullYear();
      return `${y}-${y + 1}`;
    }
    const last = annees[0]?.libelle || '';
    const [, fin] = last.split('-');
    if (fin) return `${fin}-${parseInt(fin) + 1}`;
    return '';
  };

  const handleCreate = async () => {
    // Validation format
    const format = /^\d{4}-\d{4}$/;
    if (!format.test(libelle)) {
      toast.error('Format invalide — exemple : 2026-2027');
      return;
    }
    const [debut, fin] = libelle.split('-').map(Number);
    if (fin !== debut + 1) {
      toast.error('L\'année de fin doit être l\'année de début + 1');
      return;
    }
    // Vérifier doublon
    if (annees.find(a => a.libelle === libelle)) {
      toast.error('Cette année scolaire existe déjà');
      return;
    }

    setCreating(true);
    try {
      await anneeScolaireService.create(libelle);
      toast.success(`Année ${libelle} créée avec succès`);
      setShowModal(false);
      setLibelle('');
      fetchAnnees();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  const handleActiver = async (annee) => {
    setActivating(true);
    try {
      await anneeScolaireService.activer(annee.id);
      toast.success(`Année ${annee.libelle} activée — toutes les nouvelles inscriptions iront dans cette année`);
      setShowConfirm(null);
      fetchAnnees();
    } catch {
      toast.error('Erreur lors de l\'activation');
    } finally {
      setActivating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-3xl">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Années scolaires</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gérez les années scolaires et activez la nouvelle rentrée
            </p>
          </div>
          <Button onClick={() => { setShowModal(true); setLibelle(getNextLibelle()); }}>
            <Plus size={15} className="mr-1.5"/> Nouvelle année
          </Button>
        </div>

        {/* Guide d'utilisation */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CalendarDays size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-medium text-blue-800">Comment gérer les années scolaires ?</p>
              <ul className="text-xs text-blue-600 mt-1.5 space-y-1">
                <li>• <b>En début d'année scolaire</b> (septembre) : créez la nouvelle année et activez-la</li>
                <li>• <b>L'année active</b> reçoit toutes les nouvelles inscriptions automatiquement</li>
                <li>• <b>Les années passées</b> sont conservées avec toutes leurs données</li>
                <li>• <b>Une seule année</b> peut être active à la fois</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Liste des années */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : (
          <div className="space-y-3">
            {annees.map((annee) => (
              <div
                key={annee.id}
                className={`bg-white rounded-xl border-2 p-5 transition-all
                  ${annee.active
                    ? 'border-green-400 shadow-md shadow-green-50'
                    : 'border-gray-100 shadow-sm'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">

                    {/* Icône statut */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                      ${annee.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <CalendarDays size={22} className={annee.active ? 'text-green-600' : 'text-gray-400'}/>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">{annee.libelle}</h3>
                        {annee.active && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle size={11}/> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Du {formatDate(annee.date_debut)} au {formatDate(annee.date_fin)}
                      </p>
                    </div>
                  </div>

                  {/* Stats + action */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users size={13}/>
                        <span className="text-sm font-semibold text-gray-700">
                          {annee.total_eleves || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">élèves</p>
                    </div>

                    {!annee.active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirm(annee)}
                      >
                        <CheckCircle size={13} className="mr-1.5"/>
                        Activer
                      </Button>
                    )}
                  </div>
                </div>

                {/* Barre de progression visuelle pour année active */}
                {annee.active && (
                  <div className="mt-3 pt-3 border-t border-green-100">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-green-500"/>
                      <p className="text-xs text-green-600 font-medium">
                        Année en cours — toutes les nouvelles inscriptions sont rattachées à cette année
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {annees.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CalendarDays size={40} className="mx-auto mb-3 opacity-30"/>
                <p className="text-sm">Aucune année scolaire créée</p>
                <p className="text-xs mt-1">Cliquez sur "Nouvelle année" pour commencer</p>
              </div>
            )}
          </div>
        )}

        {/* ── MODAL CRÉER ANNÉE ── */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Créer une nouvelle année scolaire</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500"/>
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Année scolaire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={libelle}
                    onChange={(e) => setLibelle(e.target.value)}
                    placeholder="Ex : 2026-2027"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-semibold tracking-wider"
                    maxLength={9}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Format : AAAA-AAAA (ex : 2026-2027)</p>
                </div>

                {/* Aperçu dates automatiques */}
                {libelle && /^\d{4}-\d{4}$/.test(libelle) && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">Dates calculées automatiquement :</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                      <div>
                        <span className="text-blue-400">Début :</span><br/>
                        <b>1er septembre {libelle.split('-')[0]}</b>
                      </div>
                      <div>
                        <span className="text-blue-400">Fin :</span><br/>
                        <b>31 juillet {libelle.split('-')[1]}</b>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-gray-100 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" loading={creating} onClick={handleCreate}>
                  Créer l'année
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL CONFIRMATION ACTIVATION ── */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle size={20} className="text-amber-600"/>
                  </div>
                  <h3 className="font-semibold text-gray-800">Confirmer l'activation</h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-600 mb-3">
                  Vous êtes sur le point d'activer l'année scolaire <b>{showConfirm.libelle}</b>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 space-y-1">
                  <p>• L'année actuelle sera désactivée</p>
                  <p>• Toutes les nouvelles inscriptions iront dans <b>{showConfirm.libelle}</b></p>
                  <p>• Les données des années précédentes sont conservées</p>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowConfirm(null)}>
                  Annuler
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  loading={activating}
                  onClick={() => handleActiver(showConfirm)}
                >
                  <CheckCircle size={14} className="mr-1.5"/>
                  Activer {showConfirm.libelle}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AnneesScolaires;