import React, { useState } from 'react';
import { User } from '../types';
import { login } from '../services/authService';
import { Button } from '../components/ui/Button';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      onLoginSuccess(response.user);
    } catch (err) {
      setError('Credenciales inválidas. Intenta: admin@vitrus.com / password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h2 className="text-3xl font-bold text-textMain tracking-tight">Bienvenido a Vitrus</h2>
            <p className="mt-2 text-textMuted">
              Gestión de proyectos inteligente para estudios modernos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-textMain mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="admin@vitrus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-textMain mb-2">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-error text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3" isLoading={isLoading}>
              Iniciar Sesión
            </Button>

            <div className="mt-6 text-center text-sm">
              <span className="text-textMuted">¿No tienes cuenta?</span>{' '}
              <a href="#" className="font-medium text-primary hover:text-primaryHover">
                Crear un estudio
              </a>
            </div>
          </form>

          <div className="pt-8 border-t border-gray-100">
             <p className="text-xs text-textMuted text-center">
               Credenciales Demo:<br/>
               Admin: admin@vitrus.com | password<br/>
               Studio: studio@agency.com | password
             </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-primary to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">Escala tu Agencia</h2>
          <p className="text-lg text-white/80 max-w-md">
            La plataforma todo en uno para gestionar clientes, proyectos y finanzas sin fricción.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6 max-w-lg">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <h3 className="font-bold text-2xl mb-1">99.9%</h3>
              <p className="text-sm text-white/70">Uptime Garantizado</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <h3 className="font-bold text-2xl mb-1">Multi</h3>
              <p className="text-sm text-white/70">Tenant Architecture</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};