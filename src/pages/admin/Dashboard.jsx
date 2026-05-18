import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eleveService } from '../../services/eleveService';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Users, UserCheck, UserX, Clock,
  BookOpen, GraduationCap, CreditCard, TrendingUp
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bg, link }) => (
  <Link to={link || '#'} className="block">
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
        </div>
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon size={22} className={color}/>
        </div>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eleveService.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Année scolaire */}
        <div className="bg-gradient-to-r from-[#1A2E4A] to-blue-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <TrendingUp size={24}/>
            <div>
              <p className="text-blue-200 text-sm">Année scolaire active</p>
              <p className="text-xl font-bold">{stats?.annee_scolaire || '2025-2026'}</p>
            </div>
          </div>
        </div>

        {/* Stats élèves */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Élèves
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Élèves actifs"
              value={stats?.eleves?.actifs}
              icon={UserCheck}
              color="text-green-600"
              bg="bg-green-50"
              link="/admin/eleves?statut=actif"
            />
            <StatCard
              title="En attente"
              value={stats?.eleves?.en_attente}
              icon={Clock}
              color="text-amber-600"
              bg="bg-amber-50"
              link="/admin/eleves?statut=en_attente"
            />
            <StatCard
              title="Inactifs"
              value={stats?.eleves?.inactifs}
              icon={UserX}
              color="text-gray-500"
              bg="bg-gray-50"
              link="/admin/eleves?statut=inactif"
            />
            <StatCard
              title="Paiements en attente"
              value={stats?.eleves?.paiements_en_attente}
              icon={CreditCard}
              color="text-red-600"
              bg="bg-red-50"
            />
          </div>
        </div>

        {/* Stats centre */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Centre
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Classes"
              value={stats?.classes}
              icon={BookOpen}
              color="text-blue-600"
              bg="bg-blue-50"
              link="/admin/classes"
            />
            <StatCard
              title="Enseignants actifs"
              value={stats?.enseignants}
              icon={GraduationCap}
              color="text-purple-600"
              bg="bg-purple-50"
              link="/admin/enseignants"
            />
          </div>
        </div>

        {/* Raccourcis rapides */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              to="/admin/eleves?statut=en_attente"
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors"
            >
              <Clock size={20} className="text-amber-600 mb-2"/>
              <p className="font-medium text-amber-800 text-sm">Valider des inscriptions</p>
              <p className="text-xs text-amber-600 mt-0.5">{stats?.eleves?.en_attente} en attente</p>
            </Link>
            <Link
              to="/admin/eleves"
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition-colors"
            >
              <Users size={20} className="text-blue-600 mb-2"/>
              <p className="font-medium text-blue-800 text-sm">Voir tous les élèves</p>
              <p className="text-xs text-blue-600 mt-0.5">Liste complète</p>
            </Link>
            <Link
              to="/inscription"
              className="bg-green-50 border border-green-200 rounded-xl p-4 hover:bg-green-100 transition-colors"
              target="_blank"
            >
              <UserCheck size={20} className="text-green-600 mb-2"/>
              <p className="font-medium text-green-800 text-sm">Formulaire d'inscription</p>
              <p className="text-xs text-green-600 mt-0.5">Ouvrir la page publique</p>
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;