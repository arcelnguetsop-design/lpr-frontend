import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import {
  Plus, ChevronDown, ChevronUp,
  X, FileText, Users, Check, Trash2,
  BookOpen, GraduationCap
} from 'lucide-react';

const TYPES = [
  { value: 'sequence',     label: 'Séquence' },
  { value: 'examen_blanc', label: 'Examen blanc' },
];

// Grouper les évaluations par libellé+trimestre
const groupEvaluations = (evaluations) => {
  const groups = {};
  for (const ev of evaluations) {
    const key = `${ev.libelle}__${ev.trimestre}__${ev.date_eval}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        libelle   : ev.libelle,
        type      : ev.type,
        trimestre : ev.trimestre,
        date_eval : ev.date_eval,
        classes   : {},
        total_notes: 0,
      };
    }
    if (!groups[key].classes[ev.classe_id]) {
      groups[key].classes[ev.classe_id] = {
        classe_id  : ev.classe_id,
        classe_nom : ev.classe_nom,
        matieres   : [],
      };
    }
    groups[key].classes[ev.classe_id].matieres.push(ev);
    groups[key].total_notes += parseInt(ev.notes_saisies || 0);
  }
  return Object.values(groups);
};

const Notes = () => {
  const [classes, setClasses]         = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [matieresByClasse, setMatieresByClasse] = useState({});

  // Navigation 3 niveaux
  const [expandedGroup, setExpandedGroup]     = useState(null);
  const [expandedClasse, setExpandedClasse]   = useState(null);
  const [expandedMatiere, setExpandedMatiere] = useState(null);
  const [detailNotes, setDetailNotes]         = useState(null);
  const [loadingNotes, setLoadingNotes]       = useState(false);

  const [filters, setFilters] = useState({ classe_id: '', trimestre: '' });

  const [form, setForm] = useState({
    libelle  : '',
    type     : 'sequence',
    trimestre: '1',
    date_eval: new Date().toISOString().split('T')[0],
  });

  const [classeSelections, setClasseSelections] = useState([
    { classe_id: '', matieres_ids: [] }
  ]);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.classes)).catch(console.error);
  }, []);

  const loadMatieres = async (classeId) => {
    if (!classeId || matieresByClasse[classeId]) return;
    try {
      const res = await api.get(`/classes/${classeId}/matieres`);
      setMatieresByClasse(prev => ({ ...prev, [classeId]: res.data.matieres }));
    } catch { console.error('Erreur chargement matières'); }
  };

  const handleClasseChange = async (index, classeId) => {
    const updated = [...classeSelections];
    updated[index] = { classe_id: classeId, matieres_ids: [] };
    setClasseSelections(updated);
    await loadMatieres(classeId);
  };

  const handleToggleMatiere = (classeIndex, matiereId) => {
    const updated = [...classeSelections];
    const ids = updated[classeIndex].matieres_ids;
    updated[classeIndex].matieres_ids = ids.includes(matiereId)
      ? ids.filter(id => id !== matiereId)
      : [...ids, matiereId];
    setClasseSelections(updated);
  };

  const handleSelectAllMatieres = (classeIndex, classeId) => {
    const updated = [...classeSelections];
    const allIds = (matieresByClasse[classeId] || []).map(m => m.id);
    updated[classeIndex].matieres_ids =
      updated[classeIndex].matieres_ids.length === allIds.length ? [] : allIds;
    setClasseSelections(updated);
  };

  const addClasseSelection = () => {
    setClasseSelections(prev => [...prev, { classe_id: '', matieres_ids: [] }]);
  };

  const removeClasseSelection = (index) => {
    if (classeSelections.length === 1) return;
    setClasseSelections(prev => prev.filter((_, i) => i !== index));
  };

  const countEvaluations = () =>
    classeSelections.reduce((t, s) => t + s.matieres_ids.length, 0);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.classe_id) params.classe_id = filters.classe_id;
      if (filters.trimestre)  params.trimestre = filters.trimestre;
      const res = await api.get('/notes/evaluations', { params });
      setEvaluations(res.data.evaluations);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvaluations(); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateEval = async () => {
    if (!form.libelle) { toast.error('Le libellé est obligatoire'); return; }
    if (countEvaluations() === 0) { toast.error('Sélectionnez au moins une matière'); return; }
    setSaving(true);
    try {
      for (const sel of classeSelections) {
        for (const matiereId of sel.matieres_ids) {
          await api.post('/notes/evaluations', {
            libelle    : form.libelle,
            type       : form.type,
            trimestre  : parseInt(form.trimestre),
            date_eval  : form.date_eval,
            classe_id  : sel.classe_id,
            matiere_id : matiereId,
          });
        }
      }
      toast.success(`${countEvaluations()} évaluation(s) créée(s)`);
      setShowModal(false);
      setForm({ libelle: '', type: 'sequence', trimestre: '1', date_eval: new Date().toISOString().split('T')[0] });
      setClasseSelections([{ classe_id: '', matieres_ids: [] }]);
      fetchEvaluations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleViewNotes = async (evalId) => {
    if (expandedMatiere === evalId) {
      setExpandedMatiere(null);
      setDetailNotes(null);
      return;
    }
    setExpandedMatiere(evalId);
    setLoadingNotes(true);
    try {
      const res = await api.get(`/notes/evaluations/${evalId}`);
      setDetailNotes(res.data);
    } catch {
      toast.error('Erreur chargement notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDeleteEval = async (evalId, e) => {
    e.stopPropagation();
    if (!window.confirm('Supprimer cette évaluation ?')) return;
    try {
      await api.delete(`/notes/evaluations/${evalId}`);
      toast.success('Évaluation supprimée');
      fetchEvaluations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur suppression');
    }
  };

  const grouped = groupEvaluations(evaluations);

  const typeLabel = (type) => type === 'sequence' ? 'Séquence' : 'Examen blanc';
  const typeColor = (type) => type === 'sequence' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700';

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Notes & Évaluations</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Créez les évaluations et consultez les notes par classe et par matière
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={15} className="mr-1.5"/> Nouvelle évaluation
          </Button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
          <select
            value={filters.classe_id}
            onChange={(e) => setFilters(f => ({ ...f, classe_id: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select
            value={filters.trimestre}
            onChange={(e) => setFilters(f => ({ ...f, trimestre: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les trimestres</option>
            <option value="1">Trimestre 1</option>
            <option value="2">Trimestre 2</option>
            <option value="3">Trimestre 3</option>
          </select>
        </div>

        {/* ── NIVEAU 1 — Groupes d'évaluations ── */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm">Aucune évaluation créée</p>
            <p className="text-xs mt-1">Cliquez sur "Nouvelle évaluation" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map((group) => (
              <div key={group.key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Header groupe — NIVEAU 1 */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedGroup(expandedGroup === group.key ? null : group.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-purple-600"/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{group.libelle}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor(group.type)}`}>
                          {typeLabel(group.type)}
                        </span>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Trimestre {group.trimestre}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {new Date(group.date_eval).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'long', year: 'numeric'
                          })}
                        </p>
                        <span className="text-gray-200">•</span>
                        <p className="text-xs text-gray-500 font-medium">
                          {Object.keys(group.classes).length} classe(s)
                        </p>
                        <span className="text-gray-200">•</span>
                        <p className="text-xs text-gray-500">
                          {Object.values(group.classes).reduce((t, c) => t + c.matieres.length, 0)} matière(s)
                        </p>
                        {group.total_notes > 0 && (
                          <>
                            <span className="text-gray-200">•</span>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <Users size={11}/> {group.total_notes} notes saisies
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedGroup === group.key
                    ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0"/>
                    : <ChevronDown size={16} className="text-gray-400 flex-shrink-0"/>
                  }
                </div>

                {/* ── NIVEAU 2 — Classes ── */}
                {expandedGroup === group.key && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                    {Object.values(group.classes).map((cls) => (
                      <div key={cls.classe_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">

                        {/* Header classe */}
                        <div
                          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => setExpandedClasse(
                            expandedClasse === `${group.key}_${cls.classe_id}`
                              ? null
                              : `${group.key}_${cls.classe_id}`
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                              <GraduationCap size={14} className="text-blue-600"/>
                            </div>
                            <p className="text-sm font-medium text-gray-700">{cls.classe_nom}</p>
                            <span className="text-xs text-gray-400">
                              — {cls.matieres.length} matière(s)
                            </span>
                          </div>
                          {expandedClasse === `${group.key}_${cls.classe_id}`
                            ? <ChevronUp size={14} className="text-gray-400"/>
                            : <ChevronDown size={14} className="text-gray-400"/>
                          }
                        </div>

                        {/* ── NIVEAU 3 — Matières ── */}
                        {expandedClasse === `${group.key}_${cls.classe_id}` && (
                          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-1.5">
                            {cls.matieres.map((mat) => (
                              <div key={mat.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden">

                                {/* Header matière */}
                                <div
                                  className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-purple-50 transition-colors"
                                  onClick={() => handleViewNotes(mat.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-purple-50 rounded-md flex items-center justify-center">
                                      <BookOpen size={12} className="text-purple-600"/>
                                    </div>
                                    <p className="text-sm text-gray-700">{mat.matiere_nom}</p>
                                    <span className="text-xs text-gray-400">coef. {mat.coefficient || '—'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium flex items-center gap-1 ${
                                      parseInt(mat.notes_saisies) > 0 ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                      <Users size={11}/>
                                      {mat.notes_saisies} note(s)
                                    </span>
                                    <button
                                      onClick={(e) => handleDeleteEval(mat.id, e)}
                                      className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                                      title="Supprimer"
                                    >
                                      <Trash2 size={12}/>
                                    </button>
                                    {expandedMatiere === mat.id
                                      ? <ChevronUp size={13} className="text-gray-400"/>
                                      : <ChevronDown size={13} className="text-gray-400"/>
                                    }
                                  </div>
                                </div>

                                {/* Notes de la matière */}
                                {expandedMatiere === mat.id && (
                                  <div className="border-t border-gray-100 bg-gray-50 px-3 py-3">
                                    {loadingNotes ? (
                                      <div className="flex justify-center py-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"/>
                                      </div>
                                    ) : !detailNotes || detailNotes.notes.length === 0 ? (
                                      <p className="text-center text-xs text-gray-400 py-2">
                                        Aucune note saisie — en attente de l'enseignant
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                        {detailNotes.notes.map((n, idx) => (
                                          <div key={idx} className="bg-white rounded-lg px-2.5 py-2 border border-gray-100 flex items-center justify-between">
                                            <p className="text-xs font-medium text-gray-700 truncate min-w-0">
                                              {n.nom} {n.prenom}
                                            </p>
                                            <span className={`text-sm font-bold ml-2 flex-shrink-0 ${
                                              n.absent ? 'text-gray-400' :
                                              n.valeur && parseFloat(n.valeur) >= 10 ? 'text-green-600' : 'text-red-500'
                                            }`}>
                                              {n.absent ? 'ABS' : n.valeur ? parseFloat(n.valeur).toFixed(2) : '—'}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── MODAL CRÉER ÉVALUATION ── */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">

              <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold text-gray-800">Nouvelle évaluation</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500"/>
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Libellé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.libelle}
                    onChange={(e) => setForm(f => ({ ...f, libelle: e.target.value }))}
                    placeholder="Ex : Séquence 1, Examen blanc trimestre 2..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Trimestre</label>
                    <select
                      value={form.trimestre}
                      onChange={(e) => setForm(f => ({ ...f, trimestre: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Trimestre 1</option>
                      <option value="2">Trimestre 2</option>
                      <option value="3">Trimestre 3</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={form.date_eval}
                    onChange={(e) => setForm(f => ({ ...f, date_eval: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Classes & Matières <span className="text-red-500">*</span>
                    </label>
                    <button type="button" onClick={addClasseSelection}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <Plus size={12}/> Ajouter une classe
                    </button>
                  </div>

                  <div className="space-y-3">
                    {classeSelections.map((sel, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <select
                            value={sel.classe_id}
                            onChange={(e) => handleClasseChange(index, e.target.value)}
                            className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Choisir une classe...</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                          </select>
                          {classeSelections.length > 1 && (
                            <button type="button" onClick={() => removeClasseSelection(index)}
                              className="p-1 rounded-lg hover:bg-red-50 text-red-400">
                              <X size={14}/>
                            </button>
                          )}
                        </div>

                        {sel.classe_id && (
                          <div className="ml-8">
                            <button type="button"
                              onClick={() => handleSelectAllMatieres(index, sel.classe_id)}
                              className="text-xs text-blue-600 hover:underline mb-2 flex items-center gap-1">
                              {sel.matieres_ids.length === (matieresByClasse[sel.classe_id] || []).length && sel.matieres_ids.length > 0
                                ? '✗ Tout désélectionner' : '✓ Tout sélectionner'}
                            </button>

                            {(matieresByClasse[sel.classe_id] || []).length === 0 ? (
                              <p className="text-xs text-gray-400 italic">
                                Aucune matière — ajoutez-en dans la page Classes
                              </p>
                            ) : (
                              <div className="grid grid-cols-2 gap-1.5">
                                {(matieresByClasse[sel.classe_id] || []).map((mat) => {
                                  const checked = sel.matieres_ids.includes(mat.id);
                                  return (
                                    <label key={mat.id}
                                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer border transition-all ${
                                        checked ? 'bg-blue-50 border-blue-300 text-blue-700'
                                               : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200'}`}>
                                      <input type="checkbox" checked={checked}
                                        onChange={() => handleToggleMatiere(index, mat.id)}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600"/>
                                      <span className="text-xs font-medium truncate">{mat.nom}</span>
                                      <span className="text-xs text-gray-400 ml-auto flex-shrink-0">c.{mat.coefficient}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {sel.matieres_ids.length > 0 && (
                              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                                <Check size={11}/> {sel.matieres_ids.length} matière(s) sélectionnée(s)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {countEvaluations() > 0 && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ {countEvaluations()} évaluation(s) seront créées
                      </p>
                      <div className="mt-1 space-y-0.5">
                        {classeSelections.filter(s => s.matieres_ids.length > 0).map((sel, i) => {
                          const classe = classes.find(c => c.id === sel.classe_id);
                          const mats = (matieresByClasse[sel.classe_id] || [])
                            .filter(m => sel.matieres_ids.includes(m.id)).map(m => m.nom).join(', ');
                          return <p key={i} className="text-xs text-green-600">• {classe?.nom} : {mats}</p>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" loading={saving} onClick={handleCreateEval}>
                  Créer {countEvaluations() > 1 ? `${countEvaluations()} évaluations` : "l'évaluation"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Notes;