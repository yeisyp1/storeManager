import React, { useEffect, useState } from 'react';
import { getVentasDiarias, exportarPDF } from '../api/api';
import { FileText, Download, TrendingUp, DollarSign, Package, Calendar, RefreshCw, AlertCircle } from 'lucide-react';

const Reportes = () => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState('');
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [error, setError] = useState(null);

  const fetchReporte = async (fechaSeleccionada = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVentasDiarias(fechaSeleccionada);
      setReporte(data);
    } catch (err) {
      console.error('Detalles del error:', err.response?.data || err.message);
      setError(err.response?.data?.error || err.message || 'Error al cargar el reporte');
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporte();
  }, []);

  const handleFechaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    fetchReporte(nuevaFecha || null);
  };

  const handleExportarPDF = async () => {
    setLoadingPDF(true);
    try {
      const blob = await exportarPDF(fecha || null);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ReporteVentas_${fecha || 'hoy'}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exportando PDF:', err);
      alert('Error al exportar PDF: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-700">Cargando reporte...</p>
          <p className="text-sm text-gray-500 mt-2">Consultando base de datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-700">Error</h2>
          </div>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => fetchReporte(fecha || null)}
            className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Intentar de nuevo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Reporte de ventas</h1>
          </div>
          <button
            onClick={handleExportarPDF}
            disabled={loadingPDF || !reporte || reporte.totalVentas === 0}
            className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
          >
            <Download className="w-5 h-5" />
            <span>{loadingPDF ? 'Generando PDF...' : 'Exportar PDF'}</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="w-5 h-5 text-blue-500" />
              <label className="font-semibold">Seleccionar fecha:</label>
            </div>
            <input
              type="date"
              value={fecha}
              onChange={handleFechaChange}
              className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {fecha && (
              <button
                onClick={() => {
                  setFecha('');
                  fetchReporte(null);
                }}
                className="text-blue-500 hover:text-blue-700 font-semibold flex items-center space-x-1 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ver hoy</span>
              </button>
            )}
          </div>
        </div>

        {reporte && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6 shadow-md">
            <div className="flex items-center space-x-2 text-blue-700">
              <Calendar className="w-5 h-5" />
              <p className="font-semibold">
                Fecha consultada: {reporte.fecha} | Total encontrado: {reporte.totalVentas} {reporte.totalVentas === 1 ? 'venta' : 'ventas'}
              </p>
            </div>
          </div>
        )}

        {!reporte || reporte.totalVentas === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl font-semibold text-gray-700 mb-2">No hay ventas registradas</p>
            <p className="text-gray-500">
              No se encontraron ventas para la fecha: {reporte?.fecha || 'No definida'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Transacciones</h3>
                  <p className="text-3xl font-bold text-blue-600">{reporte.totalVentas}</p>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>

              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-green-50">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Ingresos totales</h3>
                  <p className="text-3xl font-bold text-green-600">
                    ${reporte.ingresoTotal.toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
              </div>

              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-purple-50">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Unidades vendidas</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {reporte.productosVendidos.reduce((total, prod) => total + prod.cantidad, 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reporte.productosVendidos.length} {reporte.productosVendidos.length === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-2 text-purple-600" />
                  Productos vendidos
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="p-4 text-left font-semibold text-gray-700 rounded-tl-lg">Producto</th>
                        <th className="p-4 text-left font-semibold text-gray-700">Cantidad</th>
                        <th className="p-4 text-left font-semibold text-gray-700 rounded-tr-lg">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.productosVendidos.map((prod, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{prod.nombre}</td>
                          <td className="p-4 text-gray-600">{prod.cantidad}</td>
                          <td className="p-4 font-semibold text-green-600">
                            ${prod.ingresos.toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Detalle de Ventas
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="p-4 text-left font-semibold text-gray-700 rounded-tl-lg">ID</th>
                        <th className="p-4 text-left font-semibold text-gray-700">Vendedor</th>
                        <th className="p-4 text-left font-semibold text-gray-700 rounded-tr-lg">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.ventas.map((v) => (
                        <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-blue-600">#{v.id}</td>
                          <td className="p-4 text-gray-700">{v.usuario?.username || 'N/A'}</td>
                          <td className="p-4 font-semibold text-green-600">
                            ${parseFloat(v.total).toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reportes;