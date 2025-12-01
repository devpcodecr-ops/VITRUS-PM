import { UserRole } from '../types';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export interface GlobalStats {
  activeStudios: number;
  totalUsers: number;
  totalProjects: number;
  mrr: number;
}

export const getGlobalStats = async (): Promise<GlobalStats> => {
  const response = await fetch('/api/studios/stats', {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Error fetching global stats');
  return response.json();
};

// Para Admin de Estudio, obtenemos conteos rápidos (en una app más compleja, habría un endpoint dedicado)
// Aquí simularemos el dashboard de estudio obteniendo listas y contando
export const getStudioStats = async () => {
  // En producción, esto debería ser un endpoint /api/reports/dashboard
  // Para este MVP, contamos las listas existentes
  
  const headers = getHeaders();
  
  const [projectsRes, usersRes] = await Promise.all([
    fetch('/api/projects', { headers }),
    fetch('/api/users', { headers })
  ]);

  if (!projectsRes.ok || !usersRes.ok) throw new Error('Error fetching studio stats');

  const projects = await projectsRes.json();
  const users = await usersRes.json();

  return {
    projectsCount: projects.length,
    activeProjects: projects.filter((p: any) => p.status === 'in_progress').length,
    usersCount: users.length,
    // Simulado para demo
    budget: projects.reduce((acc: number, p: any) => acc + (parseFloat(p.budget) || 0), 0)
  };
};