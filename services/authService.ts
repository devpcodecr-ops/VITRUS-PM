import { User, AuthResponse, UserRole } from '../types';

const API_URL = '/api';
// CAMBIAR A FALSE EN PRODUCCIÓN REAL SI EL BACKEND ESTÁ ACCESIBLE
const USE_MOCK_DEMO = true; 

const mockLogin = (email: string, password: string): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulación de Admin Global
      if (email === 'admin@vitrus.com' && password === 'password') {
        resolve({
          token: 'mock_token_admin_global_xyz',
          user: {
            id: 1,
            studio_id: 1,
            name: 'Global Administrator',
            email,
            role: UserRole.ADMIN_GLOBAL,
          }
        });
      } 
      // Simulación de Admin de Estudio (Tenant)
      else if (email === 'studio@agency.com' && password === 'password') {
        resolve({
          token: 'mock_token_studio_10_xyz',
          user: {
            id: 2,
            studio_id: 10, // ID específico del Tenant
            name: 'Sarah Studio Admin',
            email,
            role: UserRole.ADMIN_STUDIO,
          }
        });
      } else {
        reject(new Error('Credenciales inválidas (Demo: use los emails provistos)'));
      }
    }, 800);
  });
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  if (USE_MOCK_DEMO) {
    try {
      const data = await mockLogin(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (e) {
      throw e;
    }
  } else {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en inicio de sesión');
      }

      const data: AuthResponse = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('API Login Error:', error);
      throw error;
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) return JSON.parse(userStr);
  return null;
};
