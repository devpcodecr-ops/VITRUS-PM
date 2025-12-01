import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Users as UsersIcon, AlertCircle, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { User, UserRole } from '../types';
import { getCurrentUser } from '../services/authService';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<Partial<User> & { password?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const authenticatedUser = getCurrentUser();
  const isGlobalAdmin = authenticatedUser?.role === UserRole.ADMIN_GLOBAL;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (currentUserData.id) {
        // Actualizar
        await updateUser(currentUserData.id, currentUserData);
      } else {
        // Crear
        await createUser(currentUserData);
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const openModal = (user?: User) => {
    setCurrentUserData(user || { 
      email: '', 
      password: '', // Solo requerido para crear
      first_name: '', 
      last_name: '',
      role: UserRole.COLLABORATOR,
      studio_id: authenticatedUser?.studio_id,
      is_active: true
    });
    setIsModalOpen(true);
    setError('');
  };

  // Filtrado
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
            <UsersIcon className="text-secondary" /> Gestión de Usuarios
          </h1>
          <p className="text-textMuted mt-1">
            {isGlobalAdmin 
              ? 'Administración global de usuarios de todos los estudios.' 
              : 'Gestiona el acceso de los miembros de tu equipo.'}
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus size={20} className="mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nombre o email..."
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
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                {isGlobalAdmin && <th className="px-6 py-4">Estudio</th>}
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center">Cargando usuarios...</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                        {(user.first_name || user.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-textMain">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-textMuted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                       {user.role.replace('_', ' ')}
                     </span>
                  </td>
                  {isGlobalAdmin && (
                    <td className="px-6 py-4 text-textMuted">
                      {/* @ts-ignore studio_name comes from join in backend */}
                      {user.studio_name || `ID: ${user.studio_id}`}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => openModal(user)}
                      className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-gray-500 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
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
                {currentUserData.id ? 'Editar Usuario' : 'Crear Usuario'}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1">Nombre</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={currentUserData.first_name || ''}
                    onChange={e => setCurrentUserData({...currentUserData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1">Apellido</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={currentUserData.last_name || ''}
                    onChange={e => setCurrentUserData({...currentUserData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMain mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  disabled={!!currentUserData.id} // No editar email una vez creado
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100"
                  value={currentUserData.email || ''}
                  onChange={e => setCurrentUserData({...currentUserData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textMain mb-1">
                  {currentUserData.id ? 'Nueva Contraseña (Dejar en blanco para mantener)' : 'Contraseña'}
                </label>
                <input 
                  type="password" 
                  required={!currentUserData.id}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={currentUserData.password || ''}
                  onChange={e => setCurrentUserData({...currentUserData, password: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMain mb-1">Rol</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                    value={currentUserData.role}
                    onChange={e => setCurrentUserData({...currentUserData, role: e.target.value as UserRole})}
                  >
                    <option value={UserRole.ADMIN_STUDIO}>Admin Estudio</option>
                    <option value={UserRole.COLLABORATOR}>Colaborador</option>
                    <option value={UserRole.CLIENT}>Cliente</option>
                    {isGlobalAdmin && <option value={UserRole.ADMIN_GLOBAL}>Admin Global</option>}
                  </select>
                </div>
                {isGlobalAdmin && !currentUserData.id && (
                  <div>
                    <label className="block text-sm font-medium text-textMain mb-1">ID Estudio</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      value={currentUserData.studio_id || ''}
                      onChange={e => setCurrentUserData({...currentUserData, studio_id: parseInt(e.target.value)})}
                    />
                  </div>
                )}
                {currentUserData.id && (
                  <div>
                     <label className="block text-sm font-medium text-textMain mb-1">Estado</label>
                     <select 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                        value={currentUserData.is_active ? 'true' : 'false'}
                        onChange={e => setCurrentUserData({...currentUserData, is_active: e.target.value === 'true'})}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {currentUserData.id ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};