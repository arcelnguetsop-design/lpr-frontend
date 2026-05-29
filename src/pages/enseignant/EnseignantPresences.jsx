import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import EnseignantLayout from './EnseignantLayout';
import api from '../../services/api';
import { generateFeuilleAppelPDF } from '../../services/pdfService';

const STATUTS = {
  present : { label: 'P',       color: 'bg-green-500 text-white',  ring: 'ring-green-500' },
  absent  : { label: 'A',       color: 'bg-red-500 text-white',    ring: 'ring-red-500'   },
  retard  : { label: 'R',       color: 'bg-amber-500 text-white',  ring: 'ring-amber-500' },
};

const EnseignantPresences = () => {
  const [step, setStep]               = useState('classe'); // classe | matiere | appel
  const [classes, setClasses]         = useState([]);
  const [matieres, setMatieres]       = useState([]);
  const [eleves, setEleves]           = useState([]);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [presences, setPresences]     = useState({});
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);

  // Chargement classes
  useEffect(() => {
    api.get('/classes')
      .then(r => setClasses(r.data.classes || r.data || []))
      .catch(console.error);
  }, []);

  // Chargement matières de la classe
  const loadMatieres = async (classe) => {
    setSelectedClasse(classe);
    setLoading(true);
    try {
      const r = await api.get('/notes/evaluations', { params: { classe_id: classe.id } });
      const evals = r.data.evaluations || [];
      // Extraire les matières uniques
      const matMap = {};
      evals.forEach(ev => {
        if (ev.matiere_id && !matMap[ev.matiere_id]) {
          matMap[ev.matiere_id] = { id: ev.matiere_id, nom: ev.matiere_nom };
        }
      });
      setMatieres(Object.values(matMap));
      setStep('matiere');
    } catch {
      toast.error('Erreur chargement matières');
    } finally {
      setLoading(false);
    }
  };

  // Chargement élèves de la matière
  const loadEleves = async (matiere) => {
    setSelectedMatiere(matiere);
    setLoading(true);
    try {
      const r = await api.get(`/eleves/par-matiere/${matiere.id}`);
      const elevesData = r.data.eleves || [];
      setEleves(elevesData);
      // Initialiser tous présents
      const init = {};
      elevesData.forEach(e => { init[e.id] = 'present'; });
      setPresences(init);
      setStep('appel');
    } catch {
      toast.error('Erreur chargement élèves');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatut = (eleveId) => {
    const ordre = ['present', 'absent', 'retard'];
    setPresences(prev => {
      const current = prev[eleveId] || 'present';
      const next = ordre[(ordre.indexOf(current) + 1) % ordre.length];
      return { ...prev, [eleveId]: next };
    });
  };

  const savePresences = async () => {
    setSaving(true);
    try {
      await api.post('/presences', {
        classe_id : selectedClasse.id,
        matiere_id: selectedMatiere.id,
        date_appel: date,
        presences : eleves.map(e => ({
          eleve_id: e.id,
          statut  : presences[e.id] || 'present',
        })),
      });
      toast.success('Présences enregistrées ✓');
      // Reset
      setStep('classe');
      setSelectedClasse(null);
      setSelectedMatiere(null);
      setEleves([]);
    } catch {
      toast.error('Erreur enregistrement présences');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const user = JSON.parse(localStorage.getItem('lpr_enseignant_user') || '{}');
      generateFeuilleAppelPDF({
        classe_nom    : selectedClasse?.nom,
        matiere_nom   : selectedMatiere?.nom,
        date_appel    : date,
        enseignant_nom: `${user.nom} ${user.prenom}`,
        eleves        : eleves.map(e => ({
          id    : e.id,
          nom   : e.nom,
          prenom: e.prenom,
          statut: presences[e.id] || 'present',
        })),
      });
      toast.success('PDF téléchargé ✓');
    } catch {
      toast.error('Erreur génération PDF');
    }
  };

  const counts = {
    present: Object.values(presences).filter(s => s === 'present').length,
    absent : Object.values(presences).filter(s => s === 'absent').length,
    retard : Object.values(presences).filter(s => s === 'retard').length,
  };

  // ── ÉTAPE 1 : Choisir une classe ──────────────────────
  if (step === 'classe') return (
    <EnseignantLayout>
      <div className="max-w-lg space-y-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Feuille d'appel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Étape 1 — Choisissez une classe</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <p className="text-sm">Aucune classe disponible</p>
          </div>
        ) : (
          <div className="space-y-2">
            {classes.map(classe => (
              <button
                key={classe.id}
                onClick={() => loadMatieres(classe)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-800">{classe.nom}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </EnseignantLayout>
  );

  // ── ÉTAPE 2 : Choisir une matière ─────────────────────
  if (step === 'matiere') return (
    <EnseignantLayout>
      <div className="max-w-lg space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('classe')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{selectedClasse?.nom}</h1>
            <p className="text-sm text-gray-500">Étape 2 — Choisissez une matière</p>
          </div>
        </div>

        {matieres.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <p className="text-sm">Aucune matière pour cette classe</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matieres.map(mat => (
              <button
                key={mat.id}
                onClick={() => loadEleves(mat)}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-800">{mat.nom}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </EnseignantLayout>
  );

  // ── ÉTAPE 3 : Feuille d'appel ─────────────────────────
  return (
    <EnseignantLayout>
      <div className="max-w-lg space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('matiere')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">
              {selectedClasse?.nom} — {selectedMatiere?.nom}
            </h1>
            <p className="text-sm text-gray-500">Cliquez sur un élève pour changer son statut</p>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <label className="text-sm text-gray-600 font-medium">Date :</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Légende */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {Object.entries(STATUTS).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${val.color}`}>
                {val.label}
              </span>
              {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
            </span>
          ))}
        </div>

        {/* Liste élèves */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : eleves.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            <p className="text-sm">Aucun élève dans cette matière</p>
          </div>
        ) : (
          <div className="space-y-2">
            {eleves.map((eleve, idx) => {
              const statut = presences[eleve.id] || 'present';
              const s = STATUTS[statut];
              return (
                <button
                  key={eleve.id}
                  onClick={() => toggleStatut(eleve.id)}
                  className={`w-full bg-white rounded-xl border p-3 flex items-center gap-3 transition-all hover:shadow-sm ${
                    statut === 'absent'
                      ? 'border-red-100 bg-red-50'
                      : statut === 'retard'
                      ? 'border-amber-100 bg-amber-50'
                      : 'border-gray-100'
                  }`}
                >
                  <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}</span>
                  <img
                    src={eleve.photo_url || `https://ui-avatars.com/api/?name=${eleve.nom}&background=2563EB&color=fff&size=64`}
                    alt={eleve.nom}
                    className="w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${eleve.nom}&background=2563EB&color=fff`; }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {eleve.nom} {eleve.prenom}
                    </p>
                  </div>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ring-2 ${s.color} ${s.ring}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Bouton sauvegarder */}
        {eleves.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={savePresences}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? 'Enregistrement...' : `✓ Enregistrer les présences (${eleves.length} élèves)`}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger feuille d'appel PDF
            </button>
          </div>
        )}
      </div>
    </EnseignantLayout>
  );
};

export default EnseignantPresences;