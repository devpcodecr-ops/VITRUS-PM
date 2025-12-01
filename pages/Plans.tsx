import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ShieldCheck, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getPlans, createPlan, updatePlan, deletePlan, Plan } from '../services/planService';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      console.error(err);
      setError('Error cargando planes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (currentPlan.id) {
        await updatePlan(currentPlan.id, currentPlan);
      } else {
        await createPlan(currentPlan);
      }
      setIsModalOpen(false);
      loadPlans();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este plan?')) {
      try {
        await deletePlan(id);
        setPlans(plans.filter(p => p.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const openModal = (plan?: Plan) => {
    setCurrentPlan(plan || { 
      name: '', 
      price: 0, 
      max_users: 5, 
      max_projects: 10, 
      max_storage_gb: 5,
      is_active: true 
    });
    setIsModalOpen(true);
    setError('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
            <ShieldCheck className="text-primary" /> Planes de Suscripción
          </h1>
          <p className="text-textMuted mt-1">Configura los niveles de servicio ofrecidos a los estudios.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={20} className="mr-2" />
          Nuevo Plan
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-textMuted text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Precio (Mensual)</th>
                <th className="px-6 py-4">Límite Usuarios</th>
                <th className="px-6 py-4">Límite Proyectos</th>
                <th className="px-6 py-4">Almacenamiento</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center">Cargando planes...</td></tr>
              ) : plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-textMain">{plan.name}</td>
                  <td className="px-6 py-4 font-bold text-success">${plan.price}</td>
                  <td className="px-6 py-4">{plan.max_users}</td>
                  <td className="px-6 py-4">{plan.max_projects}</td>
                  <td className="px-6 py-4">{plan.max_storage_gb} GB</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => openModal(plan)} className="p-2 text-gray-500 hover:text-primary transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-500 hover:text-error transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-textMain">{currentPlan.id ? 'Editar Plan' : 'Crear Plan'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-error text-sm rounded-lg">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={currentPlan.name || ''} onChange={e => setCurrentPlan({...currentPlan, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio ($)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={currentPlan.price || 0} onChange={e => setCurrentPlan({...currentPlan, price: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Usuarios</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={currentPlan.max_users || 0} onChange={e => setCurrentPlan({...currentPlan, max_users: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Proyectos</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={currentPlan.max_projects || 0} onChange={e => setCurrentPlan({...currentPlan, max_projects: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Storage (GB)</label>
                  <input required type="number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" 
                    value={currentPlan.max_storage_gb || 0} onChange={e => setCurrentPlan({...currentPlan, max_storage_gb: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" isLoading={isSaving}>Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
