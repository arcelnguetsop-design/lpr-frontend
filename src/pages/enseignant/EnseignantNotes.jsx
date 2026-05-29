import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import EnseignantLayout from './EnseignantLayout';
import api from '../../services/api';

const EnseignantNotes = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [classes, setClasses]         = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState('');
  const [loading, setLoading]         = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  const [notes, setNotes]             = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    api.get('/classes').then(r => setClasses(r.data.classes || r.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedClasse) params.classe_id = selectedClasse;
    if (selectedTrimestre) params.trimestre = selectedTrimestre;
    api.get('/notes/evaluations', { params })
      .then(r => setEvaluations(r.data.evaluations || []))
      .catch(() => toast.error('Erreur chargement évaluations'))
      .finally(() => setLoading(false));
  }, [selectedClasse, selectedTrimestre]);

  const loadNotes = async (eval_) => {
    setSelectedEval(eval_);
    setLoadingNotes(true);
    try {
      const r = await api.get(`/notes/evaluations/${eval_.id}`);
      setNotes(r.data.notes || []);
    } catch {
      toast.error('Erreur chargement notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const updateNote = (eleveId, field, value) => {
    setNotes(prev => prev.map(n =>
      n.eleve_id === eleveId ? { ...n, [field]: value } : n
    ));
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await api.post('/notes/saisir', {
        evaluation_id: selectedEval.id,
        notes: notes.map(n => ({
          eleve_id: n.eleve_id,
          valeur  : n.absent ? null : parseFloat(n.valeur),
          absent  : n.absent || false,
        })),
      });
      toast.success('Notes enregistrées ✓');
    } catch {
      toast.error('Erreur enregistrement notes');
    } finally {
      setSaving(false);
    }
  };

  const noteColor = (val) => {
    if (val === '' || val === null || val === undefined) return 'text-gray-400';
    const v = parseFloat(val);
    if (v >= 14) return 'text-green-600';
    if (v >= 10) return 'text-amber-600';
    return 'text-red-500';
  };

  if (selectedEval) return (
    <EnseignantLayout>
      <div className="max-w-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedEval(null); setNotes([]); }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h2 className="font-bold text-gray-800">{selectedEval.libelle}</h2>
            <p className="text-xs text-gray-500">
              {selectedEval.matiere_nom} — {selectedEval.classe_nom} — Trimestre {selectedEval.trimestre}
            </p>
          </div>
        </div>

        {/* Info éval */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
          <div className="text-sm text-blue-700">
            <span className="font-medium">Coefficient :</span> {selectedEval.coefficient} &nbsp;|&nbsp;
            <span className="font-medium">Notes saisies :</span> {selectedEval.notes_saisies}
          </div>
        </div>

        {/* Liste élèves */}
        {loadingNotes ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <p className="text-sm">Aucun élève assigné à cette matière</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note, idx) => (
              <div key={note.eleve_id}
                className={`bg-white rounded-xl border p-3 flex items-center gap-3 transition-all ${
                  note.absent ? 'border-red-100 bg-red-50' : 'border-gray-100'
                }`}
              >
                {/* Numéro */}
                <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">{idx + 1}</span>

                {/* Photo */}
                <img
                  src={note.photo_url || `https://ui-avatars.com/api/?name=${note.nom}&background=2563EB&color=fff&size=64`}
                  alt={note.nom}
                  className="w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${note.nom}&background=2563EB&color=fff`; }}
                />

                {/* Nom */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {note.nom} {note.prenom}
                  </p>
                </div>

                {/* Note input */}
                {!note.absent && (
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={note.valeur ?? ''}
                    onChange={e => updateNote(note.eleve_id, 'valeur', e.target.value)}
                    placeholder="—"
                    className={`w-16 text-center py-1.5 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${noteColor(note.valeur)}`}
                  />
                )}
                {note.absent && (
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                    Absent
                  </span>
                )}

                {/* Toggle absent */}
                <button
                  onClick={() => updateNote(note.eleve_id, 'absent', !note.absent)}
                  className={`p-1.5 rounded-lg transition-colors text-xs ${
                    note.absent
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={note.absent ? 'Marquer présent' : 'Marquer absent'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {note.absent
                      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                      : <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>
                    }
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bouton sauvegarder */}
        {notes.length > 0 && (
          <button
            onClick={saveNotes}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? 'Enregistrement...' : '✓ Enregistrer les notes'}
          </button>
        )}
      </div>
    </EnseignantLayout>
  );

  return (
    <EnseignantLayout>
      <div className="max-w-2xl space-y-4">

        <div>
          <h1 className="text-lg font-bold text-gray-800">Saisie des notes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Choisissez une évaluation pour saisir les notes
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
          <select
            value={selectedClasse}
            onChange={e => setSelectedClasse(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select
            value={selectedTrimestre}
            onChange={e => setSelectedTrimestre(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les trimestres</option>
            <option value="1">Trimestre 1</option>
            <option value="2">Trimestre 2</option>
            <option value="3">Trimestre 3</option>
          </select>
        </div>

        {/* Liste évaluations */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-30">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <p className="text-sm">Aucune évaluation trouvée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {evaluations.map(ev => (
              <button
                key={ev.id}
                onClick={() => loadNotes(ev)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{ev.libelle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ev.matiere_nom} — {ev.classe_nom}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs bg-purple-50 text-purple-700 font-medium px-2 py-1 rounded-lg">
                      T{ev.trimestre}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                      ev.notes_saisies > 0
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ev.notes_saisies} note{ev.notes_saisies !== 1 ? 's' : ''}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </EnseignantLayout>
  );
};

export default EnseignantNotes;