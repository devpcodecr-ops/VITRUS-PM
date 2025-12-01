import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { getCurrentUser, logout as logoutService } from './services/authService';
import { User } from './types';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; user: User | null }> = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
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