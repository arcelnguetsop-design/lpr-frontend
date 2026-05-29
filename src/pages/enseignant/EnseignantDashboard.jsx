import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import EnseignantLayout from './EnseignantLayout';
import api from '../../services/api';
import { authService } from '../../services/authService';

const EnseignantDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const user = authService.getEnseignantUser();

  useEffect(() => {
    api.get('/eleves/stats')
      .then(r => setStats(r.data))
      .catch(() => toast.error('Erreur chargement stats'))
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ label, value, color, icon }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center opacity-80 ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <EnseignantLayout>
      <div className="space-y-5 max-w-3xl">

        {/* Bienvenue */}
        <div className="bg-gradient-to-r from-[#1A2E4A] to-blue-700 rounded-2xl p-5 text-white">
          <p className="text-blue-200 text-sm mb-1">Bonjour 👋</p>
          <h1 className="text-xl font-bold">{user?.nom} {user?.prenom}</h1>
          <p className="text-blue-200 text-sm mt-1">Espace enseignant — Année scolaire 2025-2026</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"/>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Élèves actifs"
              value={stats?.eleves?.actifs}
              color="text-green-600"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
            />
            <StatCard
              label="Classes"
              value={stats?.classes}
              color="text-blue-600"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
            />
          </div>
        )}

        {/* Actions rapides */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <Link to="/enseignant/notes" className="block">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Saisir des notes</p>
                    <p className="text-xs text-gray-500">Choisir une évaluation</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/enseignant/presences" className="block">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Feuille d'appel</p>
                    <p className="text-xs text-gray-500">Marquer les présences</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Info compte */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">ℹ️ Votre compte</p>
          <p className="text-xs text-amber-700">
            Email : <strong>{user?.email}</strong><br/>
            Pour toute modification, contactez l'administrateur.
          </p>
        </div>

      </div>
    </EnseignantLayout>
  );
};

export default EnseignantDashboard;