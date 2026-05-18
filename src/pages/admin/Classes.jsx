import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import {
  Plus, Pencil, Trash2, X, BookOpen,
  Users, ChevronDown, ChevronUp
} from 'lucide-react';

const NIVEAUX = [
  'Terminale', 'Première', 'Seconde',
  'Troisième', 'Quatrième', 'Cinquième',
  'Sixième'
];

const EXAMENS = [
  'BAC A', 'BAC C', 'BAC D', 'BAC TI',
  'BEPC', 'CEP', 'Aucun'
];

const Classes = () => {
  const [classes, setClasses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [showMatieres, setShowMatieres] = useState(null);
  const [editing, setEditing]         = useState(null);
  const [saving, setSaving]           = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  // Formulaire classe
  const [form, setForm] = useState({
    nom: '', niveau: '', examen_prepare: ''
  });

  // Formulaire matière
  const [matiereForm, setMatiereForm] = useState({ nom: '', coefficient: 1 });
  const [matieres, setMatieres]       = useState([]);
  const [savingMatiere, setSavingMatiere] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      setClasses(res.data.classes);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const fetchMatieres = async (classeId) => {
    try {
      const res = await api.get(`/classes/${classeId}/matieres`);
      setMatieres(res.data.matieres);
    } catch {
      toast.error('Erreur chargement matières');
    }
  };

  const handleToggleMatieres = async (classeId) => {
    if (showMatieres === classeId) {
      setShowMatieres(null);
    } else {
      setShowMatieres(classeId);
      await fetchMatieres(classeId);
    }
  };

  const handleOpenModal = (classe = null) => {
    if (classe) {
      setEditing(classe);
      setForm({
        nom             : classe.nom,
        niveau          : classe.niveau,
        examen_prepare  : classe.examen_prepare || '',
      });
    } else {
      setEditing(null);
      setForm({ nom: '', niveau: '', examen_prepare: '' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.niveau) {
      toast.error('Nom et niveau obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/classes/${editing.id}`, form);
        toast.success('Classe mise à jour');
      } else {
        await api.post('/classes', form);
        toast.success('Classe créée avec succès');
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette classe ? Cette action est irréversible.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/classes/${id}`);
      toast.success('Classe supprimée');
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddMatiere = async (classeId) => {
    if (!matiereForm.nom) {
      toast.error('Nom de la matière obligatoire');
      return;
    }
    setSavingMatiere(true);
    try {
      await api.post('/classes/matieres', {
        nom         : matiereForm.nom,
        coefficient : parseInt(matiereForm.coefficient),
        classe_id   : classeId,
      });
      toast.success('Matière ajoutée');
      setMatiereForm({ nom: '', coefficient: 1 });
      await fetchMatieres(classeId);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur ajout matière');
    } finally {
      setSavingMatiere(false);
    }
  };

  const handleDeleteMatiere = async (matiereId, classeId) => {
    if (!window.confirm('Supprimer cette matière ?')) return;
    try {
      await api.delete(`/classes/matieres/${matiereId}`);
      toast.success('Matière supprimée');
      await fetchMatieres(classeId);
    } catch {
      toast.error('Erreur suppression matière');
    }
  };

  // Grouper les classes par niveau
  const classesByNiveau = classes.reduce((acc, cls) => {
    const niveau = cls.niveau || 'Autres';
    if (!acc[niveau]) acc[niveau] = [];
    acc[niveau].push(cls);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Classes & Matières</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gérez les classes du centre et leurs matières avec coefficients
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={15} className="mr-1.5"/> Nouvelle classe
          </Button>
        </div>

        {/* Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <BookOpen size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
            <div className="text-xs text-blue-700 space-y-1">
              <p className="font-medium">Comment gérer les classes ?</p>
              <p>• Créez d'abord les classes (Terminale C, Terminale D, 3ème...)</p>
              <p>• Ensuite cliquez sur une classe pour ajouter ses matières et coefficients</p>
              <p>• Les matières apparaîtront automatiquement dans l'app mobile des enseignants</p>
            </div>
          </div>
        </div>

        {/* Liste des classes */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <BookOpen size={40} className="mx-auto mb-3 text-gray-200"/>
            <p className="text-gray-500 font-medium">Aucune classe créée</p>
            <p className="text-xs text-gray-400 mt-1">Cliquez sur "Nouvelle classe" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(classesByNiveau).map(([niveau, niveauClasses]) => (
              <div key={niveau}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {niveau}
                </h2>
                <div className="space-y-2">
                  {niveauClasses.map((classe) => (
                    <div key={classe.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                      {/* Header classe */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <BookOpen size={18} className="text-blue-600"/>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{classe.nom}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">{classe.niveau}</span>
                              {classe.examen_prepare && (
                                <>
                                  <span className="text-gray-200">•</span>
                                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {classe.examen_prepare}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500 mr-2">
                            <Users size={14}/>
                            <span>{classe.total_eleves || 0} élèves</span>
                          </div>
                          <button
                            onClick={() => handleOpenModal(classe)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={15}/>
                          </button>
                          <button
                            onClick={() => handleDelete(classe.id)}
                            disabled={deletingId === classe.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={15}/>
                          </button>
                          <button
                            onClick={() => handleToggleMatieres(classe.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-600 transition-colors"
                          >
                            Matières
                            {showMatieres === classe.id
                              ? <ChevronUp size={13}/>
                              : <ChevronDown size={13}/>
                            }
                          </button>
                        </div>
                      </div>

                      {/* Panel matières */}
                      {showMatieres === classe.id && (
                        <div className="border-t border-gray-100 bg-gray-50 p-4">

                          {/* Liste matières */}
                          <div className="mb-4">
                            {matieres.length === 0 ? (
                              <p className="text-xs text-gray-400 text-center py-3">
                                Aucune matière — ajoutez-en ci-dessous
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                {matieres.map((mat) => (
                                  <div key={mat.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">{mat.nom}</p>
                                      <p className="text-xs text-gray-400">Coefficient : {mat.coefficient}</p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteMatiere(mat.id, classe.id)}
                                      className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                                    >
                                      <Trash2 size={13}/>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Formulaire ajout matière */}
                          <div className="bg-white rounded-xl p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-600 mb-2">
                              Ajouter une matière
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Nom de la matière"
                                value={matiereForm.nom}
                                onChange={(e) => setMatiereForm(f => ({ ...f, nom: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500 whitespace-nowrap">Coef.</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="9"
                                  value={matiereForm.coefficient}
                                  onChange={(e) => setMatiereForm(f => ({ ...f, coefficient: e.target.value }))}
                                  className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <Button
                                size="sm"
                                loading={savingMatiere}
                                onClick={() => handleAddMatiere(classe.id)}
                              >
                                <Plus size={14}/>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MODAL CRÉER/MODIFIER CLASSE ── */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {editing ? 'Modifier la classe' : 'Nouvelle classe'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500"/>
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Nom */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Nom de la classe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm(f => ({ ...f, nom: e.target.value }))}
                    placeholder="Ex : Terminale C, 3ème A..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Niveau */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Niveau <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.niveau}
                    onChange={(e) => setForm(f => ({ ...f, niveau: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choisir un niveau</option>
                    {NIVEAUX.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* Examen */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Examen préparé
                  </label>
                  <select
                    value={form.examen_prepare}
                    onChange={(e) => setForm(f => ({ ...f, examen_prepare: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucun / Non défini</option>
                    {EXAMENS.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" loading={saving} onClick={handleSave}>
                  {editing ? 'Mettre à jour' : 'Créer la classe'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Classes;