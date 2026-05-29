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