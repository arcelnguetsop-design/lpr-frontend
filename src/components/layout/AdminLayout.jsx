import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  LogOut, Menu, X, Bell, ChevronRight, CalendarDays, FileText, BarChart3
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate  = useNavigate();
  const user      = authService.getCurrentUser();

  const navItems = [
    { path: '/admin/dashboard',   label: 'Tableau de bord',  icon: LayoutDashboard },
    { path: '/admin/eleves',      label: 'Élèves',           icon: Users },
    { path: '/admin/enseignants', label: 'Enseignants',      icon: GraduationCap },
    { path: '/admin/classes',     label: 'Classes',          icon: BookOpen },
    { path: '/admin/annees',      label: 'Années scolaires', icon: CalendarDays },
    { path: '/admin/presences',   label: 'Présences',        icon: CalendarDays },
    { path: '/admin/notes', label: 'Notes', icon: BookOpen },
    { path: '/admin/bulletins', label: 'Bulletins', icon: FileText },
    { path: '/admin/rapports', label: 'Rapports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#1A2E4A] text-white flex flex-col transition-all duration-300 flex-shrink-0`}>

        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <div>
              <p className="font-bold text-sm leading-tight">La Porte de</p>
              <p className="font-bold text-sm leading-tight text-blue-300">la Réussite</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon size={18} className="flex-shrink-0"/>
                {sidebarOpen && <span>{label}</span>}
                {sidebarOpen && active && <ChevronRight size={14} className="ml-auto"/>}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-white/10">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-gray-400">Connecté en tant que</p>
              <p className="text-sm font-medium truncate">{user?.nom || 'Admin'}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors text-sm w-full"
          >
            <LogOut size={18} className="flex-shrink-0"/>
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-base font-semibold text-gray-800">
              {navItems.find(n => n.path === location.pathname)?.label || 'Administration'}
            </h1>
            <p className="text-xs text-gray-500">Année scolaire 2025-2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell size={18} className="text-gray-600"/>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.nom?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;