import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.login(data.email, data.password);
      toast.success('Connexion réussie !');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2E4A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">LPR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">La Porte de la Réussite</h1>
          <p className="text-blue-300 mt-1 text-sm">Espace administrateur</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Adresse email"
              name="email"
              type="email"
              placeholder="admin@lpr.cm"
              register={register}
              required
              error={errors.email}
            />
            <Input
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="••••••••"
              register={register}
              required
              error={errors.password}
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Se connecter
            </Button>
          </form>
        </div>

        <p className="text-center text-blue-400 text-xs mt-6">
          Système LPR v1.0 — 2025-2026
        </p>
      </div>
    </div>
  );
};

export default Login;