import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = (role: UserRole) => {
    const common = [
      { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'projects', path: '/projects', label: 'Proyectos', icon: Briefcase },
      { id: 'tasks', path: '/tasks', label: 'Tareas', icon: CheckSquare },
      { id: 'messages', path: '/messages', label: 'Mensajes', icon: MessageSquare },
    ];

    if (role === UserRole.ADMIN_GLOBAL) {
      return [
        { id: 'dashboard', path: '/dashboard', label: 'Global Dashboard', icon: LayoutDashboard },
        { id: 'studios', path: '/studios', label: 'Estudios (Tenants)', icon: Building2 },
        { id: 'plans', path: '/plans', label: 'Planes', icon: ShieldCheck },
        { id: 'users', path: '/users', label: 'Usuarios Globales', icon: Users },
        { id: 'accounting', path: '/accounting', label: 'Contabilidad Global', icon: FileText },
        { id: 'settings', path: '/settings', label: 'Configuración', icon: Settings },
      ];
    }

    if (role === UserRole.ADMIN_STUDIO) {
      return [
        ...common,
        { id: 'team', path: '/team', label: 'Mi Equipo', icon: Users },
        { id: 'accounting', path: '/accounting', label: 'Contabilidad', icon: FileText },
        { id: 'suppliers', path: '/suppliers', label: 'Proveedores', icon: Users },
        { id: 'settings', path: '/settings', label: 'Configuración', icon: Settings },
      ];
    }

    return common;
  };

  const menuItems = getMenuItems(user.role);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold text-textMain">Vitrus PM</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">
              {user.role === UserRole.ADMIN_GLOBAL ? 'Global Admin' : `Studio ID: ${user.studio_id}`}
            </p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === item.path 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-textMuted hover:bg-gray-50 hover:text-textMain'}
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-textMain truncate">{user.name}</p>
              <p className="text-xs text-textMuted truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-textMuted hover:bg-white hover:text-error transition-colors"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between">
           <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold text-textMain">Vitrus PM</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
