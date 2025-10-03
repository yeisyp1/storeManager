import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Package, ShoppingCart, Users, FileText, DollarSign } from 'lucide-react';
import { getVentasDiarias } from '../api/api'; 

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    ventasDelDia: 0,
    productosEnStock: 0,
    transacciones: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getVentasDiarias(null);
        
        setStats({
          ventasDelDia: data.ingresoTotal || 0,
          productosEnStock: 0, 
          transacciones: data.totalVentas || 0
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);

      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Ventas del día',
      value: loading ? '...' : `$${stats.ventasDelDia.toLocaleString('es-CO')}`,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      changeType: 'positive',
      adminOnly: true 
    },
   
    {
      title: 'Transacciones',
      value: loading ? '...' : stats.transacciones.toString(),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      changeType: 'positive',
      adminOnly: true
    }
  ];

  const actionCards = [
    {
      title: 'Caja',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      path: '/caja',
      showForAll: true,
    },
    {
      title: 'Gestionar productos',
      icon: Package,
      color: 'from-green-500 to-green-600',
      path: '/productos',
      showForAll: false,
    },
    {
      title: 'Reportes',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      path: '/reportes',
      showForAll: false,
    },
    {
      title: 'Gestionar usuarios',
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      path: '/usuarios',
      showForAll: false,
    }
  ];

  const filteredActionCards = actionCards.filter(
    card => card.showForAll || user?.rol === 'Administrador'
  );

  const filteredStatsCards = statsCards.filter(
    stat => !stat.adminOnly || user?.rol === 'Administrador'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenido, {user?.nombre || user?.username}
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filteredStatsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <span className={`text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </h3>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredActionCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(card.path)}
                  className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative p-6 z-10">
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-4 rounded-full bg-gradient-to-br ${card.color} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-white transition-colors duration-300">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;