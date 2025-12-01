import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Mock data
const INITIAL_PROJECTS = [
  { id: 1, name: "Rebranding Campaña 2024", client: "Coca-Cola", status: "En Progreso", progress: 65, date: "24 Mar 2024" },
  { id: 2, name: "Desarrollo Web E-commerce", client: "Nike Store", status: "Pendiente", progress: 10, date: "01 Abr 2024" },
  { id: 3, name: "Diseño App Móvil", client: "Startup Inc", status: "Completado", progress: 100, date: "15 Feb 2024" },
  { id: 4, name: "Estrategia SEO Q2", client: "TechFlow", status: "En Progreso", progress: 45, date: "30 Mar 2024" },
];

export const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Progreso': return 'bg-blue-100 text-blue-700';
      case 'Completado': return 'bg-green-100 text-green-700';
      case 'Pendiente': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredProjects = INITIAL_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain">Proyectos</h1>
          <p className="text-textMuted mt-1">Gestiona y supervisa todos los proyectos del estudio.</p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre o cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-textMuted text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Progreso</th>
                <th className="px-6 py-4">Fecha Entrega</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-textMain">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 text-textMuted">{project.client}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-textMuted w-8">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textMuted">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {project.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-textMain p-1 rounded-md hover:bg-gray-100">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="p-12 text-center text-textMuted">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No se encontraron proyectos.</p>
          </div>
        )}
      </div>
    </div>
  );
};