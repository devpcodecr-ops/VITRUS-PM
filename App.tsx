import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Studios } from './pages/Studios';
import { Users } from './pages/Users';
import { Plans } from './pages/Plans';
import { Settings } from './pages/Settings';
import { getCurrentUser, logout as logoutService } from './services/authService';
import { User, UserRole } from './types';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; user: User | null; roleRequired?: UserRole }> = ({ children, user, roleRequired }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    logoutService();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
        } />
        
        <Route path="/*" element={
          <ProtectedRoute user={user}>
            <Layout user={user!} onLogout={handleLogout}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard user={user!} />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<div>Tasks Module Placeholder</div>} />
                <Route path="/messages" element={<div>Messages Module Placeholder</div>} />
                
                {/* Rutas compartidas con permisos internos */}
                <Route path="/users" element={<Users />} />
                <Route path="/team" element={<Navigate to="/users" replace />} />
                <Route path="/accounting" element={<div>Accounting Module Placeholder</div>} />
                <Route path="/suppliers" element={<div>Suppliers Module Placeholder</div>} />
                
                {/* Rutas exclusivas Admin Global */}
                <Route path="/studios" element={
                  <ProtectedRoute user={user} roleRequired={UserRole.ADMIN_GLOBAL}>
                    <Studios />
                  </ProtectedRoute>
                } />
                <Route path="/plans" element={
                  <ProtectedRoute user={user} roleRequired={UserRole.ADMIN_GLOBAL}>
                    <Plans />
                  </ProtectedRoute>
                } />
                
                {/* Ruta Settings (para ambos, pero con vistas diferentes si se desea) */}
                <Route path="/settings" element={<Settings />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
