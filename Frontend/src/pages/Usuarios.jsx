import React, { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Edit2, Trash2, Eye, EyeOff, Search, Shield, UserCircle, AlertCircle, Check, X } from 'lucide-react';

const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    rol: '' 
  });
  const [editId, setEditId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      showNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (form.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!editId && !form.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (form.password && form.password.length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    try {
      if (editId) {
        await updateUsuario(editId, form);
        showNotification('Usuario actualizado exitosamente', 'success');
        setEditId(null);
      } else {
        await createUsuario(form);
        showNotification('Usuario creado exitosamente', 'success');
      }
      setForm({ username: '', password: '', rol: 'CAJERO' });
      setErrors({});
      setShowPassword(false);
      cargarUsuarios();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error al guardar usuario', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id, username) => {

    if (currentUser?.id === id) {
      showNotification('No puedes eliminar tu propia cuenta', 'error');
      return;
    }

    const adminCount = usuarios.filter(u => u.rol === 'Administrador').length;
    const usuarioAEliminar = usuarios.find(u => u.id === id);
    if (usuarioAEliminar?.rol === 'Administrador' && adminCount === 1) {
      showNotification('No puedes eliminar el último administrador', 'error');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) {
      setProcessing(true);
      try {
        await deleteUsuario(id);
        showNotification('Usuario eliminado exitosamente', 'success');
        cargarUsuarios();
      } catch (error) {
        showNotification('Error al eliminar usuario', 'error');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleEdit = (usuario) => {
    setForm({ 
      username: usuario.username, 
      password: '', 
      rol: usuario.rol 
    });
    setEditId(usuario.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm({ username: '', password: '', rol: 'CAJERO' });
    setEditId(null);
    setErrors({});
    setShowPassword(false);
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-6 py-4 rounded-lg shadow-lg transition-all transform ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <Users className="w-10 h-10 mr-3 text-blue-600" />
            Gestión de usuarios
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <UserPlus className="w-6 h-6 mr-2 text-blue-600" />
            {editId ? 'Editar Usuario' : 'Crear nuevo usuario'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  placeholder="Ej: jperez"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className={`w-full border-2 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editId ? 'Dejar vacío para no cambiar' : 'Contraseña'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full border-2 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="" disabled>Seleccione un rol</option>
                  <option value="CAJERO">Cajero</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={processing}
                className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {editId ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span>{processing ? 'Procesando...' : (editId ? 'Actualizar Usuario' : 'Crear usuario')}</span>
              </button>
              
              {editId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold"
                >
                  <X className="w-5 h-5" />
                  <span>Cancelar</span>
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Usuario</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Rol</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <UserCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No se encontraron usuarios</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((u) => (
                    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">#{u.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <UserCircle className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          u.rol === 'Administrador' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.rol === 'Administrador' && <Shield className="w-4 h-4" />}
                          <span>{u.rol}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(u)}
                            disabled={processing}
                            className="flex items-center space-x-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 transition-all duration-200 font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            disabled={processing || currentUser?.id === u.id}
                            className="flex items-center space-x-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Usuarios;