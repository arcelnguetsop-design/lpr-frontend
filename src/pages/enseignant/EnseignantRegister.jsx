import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EnseignantRegister = () => {
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', password: '', confirm: '',
  });
  const [obscure, setObscure]         = useState(true);
  const [obscureC, setObscureC]       = useState(true);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email || !form.telephone || !form.password) {
      toast.error('Tous les champs obligatoires doivent être remplis');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Mot de passe minimum 6 caractères');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register-enseignant', {
        nom      : form.nom,
        prenom   : form.prenom,
        email    : form.email,
        telephone: form.telephone,
        password : form.password,
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2E4A] to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Inscription soumise !</h2>
        <p className="text-gray-600 text-sm mb-6">
          Votre compte est en attente de validation par l'administrateur.
          Vous recevrez vos accès par WhatsApp ou email.
        </p>
        <div className="bg-blue-50 rounded-xl p-4 text-left text-sm text-blue-700 mb-5">
          <p className="font-medium mb-1">Prochaines étapes :</p>
          <ul className="space-y-1 text-xs">
            <li>• L'administrateur examine votre dossier</li>
            <li>• Vous serez contacté(e) par téléphone ou WhatsApp</li>
            <li>• Une fois validé, connectez-vous ici</li>
          </ul>
        </div>
        <button
          onClick={() => navigate('/enseignant/login')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );

  const InputField = ({ label, name, type = 'text', placeholder, icon, right }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type={type}
          value={form[name]}
          onChange={set(name)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
      </div>
    </div>
  );

  const eyeIcon = (show, toggle) => (
    <button type="button" onClick={toggle} className="text-gray-400 hover:text-gray-600">
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2E4A] to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-[#1A2E4A] text-xl font-black">LPR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">La Porte de la Réussite</h1>
          <p className="text-blue-200 text-sm mt-1">Inscription Enseignant</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-[#1A2E4A] mb-1">Créer un compte</h2>
          <p className="text-sm text-gray-500 mb-6">Remplissez vos informations ci-dessous</p>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Nom + Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={set('nom')}
                  placeholder="MBARGA"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Prénom *</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={set('prenom')}
                  placeholder="Paul"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="nom@exemple.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Téléphone / WhatsApp *</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={set('telephone')}
                placeholder="677000000"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Mot de passe *</label>
              <div className="relative">
                <input
                  type={obscure ? 'password' : 'text'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Minimum 6 caractères"
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {eyeIcon(obscure, () => setObscure(!obscure))}
                </span>
              </div>
            </div>

            {/* Confirmer */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Confirmer le mot de passe *</label>
              <div className="relative">
                <input
                  type={obscureC ? 'password' : 'text'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Répétez le mot de passe"
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {eyeIcon(obscureC, () => setObscureC(!obscureC))}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/enseignant/login" className="text-blue-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-blue-200/50 text-xs mt-6">
          Système LPR v1.0 — 2025-2026
        </p>
      </div>
    </div>
  );
};

export default EnseignantRegister;