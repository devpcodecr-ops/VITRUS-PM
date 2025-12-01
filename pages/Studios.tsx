import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getStudios, createStudio, updateStudio, deleteStudio } from '../services/studioService';
import { Studio } from '../types';

export const Studios: React.FC = () => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudio, setCurrentStudio] = useState<Partial<Studio>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Cargar estudios al inicio
  useEffect(() => {
    loadStudios();
  }, []);

  const loadStudios = async () => {
    try {
      const data = await getStudios();
      setStudios(data);
    } catch (err) {
      console.error(err);
      setError('Error cargando estudios');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (currentStudio.id) {
        // Actualizar
        await updateStudio(currentStudio.id, currentStudio);
      } else {
        // Crear
        await createStudio(currentStudio);
      }
      setIsModalOpen(false);
      loadStudios(); // Recargar tabla
    } catch (err) {
      setError('Error al guardar el estudio. Verifica los datos.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro? Esto eliminará también los usuarios y proyectos asociados.')) {
      try {
        await deleteStudio(id);
        setStudios(studios.filter(s => s.id !== id));
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  const openModal = (studio?: Studio) => {
    setCurrentStudio(studio || { name: '', email: '', plan_id: 1, subscription_status: 'active' });
    setIsModalOpen(true);
    setError('');
  };

  // Filtrado
  const filteredStudios = studios.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
            <Building2 className="text-primary" /> Gestión de Estudios (Tenants)
          </h1>
          <p className="text-textMuted mt-1">Administra los clientes y suscripciones de la plataforma SaaS.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={20} className="mr-2" />
          Nuevo Estudio
        </Button>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar estudio por nombre o email..."
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre Estudio</th>
                <th className="px-6 py-4">Email Contacto</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center">Cargando estudios...</td></tr>
              ) : filteredStudios.map((studio) => (
                <tr key={studio.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-textMuted">#{studio.id}</td>
                  <td className="px-6 py-4 font-medium text-textMain">{studio.name}</td>
                  <td className="px-6 py-4 text-textMuted">{studio.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      Plan ID: {studio.plan_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      studio.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {studio.subscription_status === 'active' ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => openModal(studio)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(studio.id)}
                      className="p-2 text-gray-500 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredStudios.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-textMuted">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                    No se encontraron estudios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-textMain">
                {currentStudio.id ? 'Editar Estudio' : 'Registrar Nuevo Estudio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-error text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Nombre del Estudio</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={currentStudio.name || ''}
                  onChange={e => setCurrentStudio({...currentStudio, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Email de Contacto</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={currentStudio.email || ''}
                  onChange={e => setCurrentStudio({...currentStudio, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1">Plan</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                    value={currentStudio.plan_id || 1}
                    onChange={e => setCurrentStudio({...currentStudio, plan_id: Number(e.target.value)})}
                  >
                    <option value={1}>Freelancer ($29)</option>
                    <option value={2}>Studio Pro ($99)</option>
                    <option value={3}>Enterprise ($299)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1">Estado</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                    value={currentStudio.subscription_status || 'active'}
                    onChange={e => setCurrentStudio({...currentStudio, subscription_status: e.target.value as any})}
                  >
                    <option value="active">Activo</option>
                    <option value="suspended">Suspendido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {currentStudio.id ? 'Guardar Cambios' : 'Crear Estudio'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};