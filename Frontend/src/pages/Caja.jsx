import React, { useState, useEffect, useRef } from "react";
import { getProductos, createVenta, api } from "../api/api";

const Caja = () => {
  const [productos, setProductos] = useState([]);
  const [venta, setVenta] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingVenta, setLoadingVenta] = useState(false);
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [buscandoCodigo, setBuscandoCodigo] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const inputCodigoRef = useRef(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    const suma = venta.reduce((acc, item) => {
      const precio = Number(item.precioUnitario) || 0;
      const cantidad = Number(item.cantidad) || 0;
      return acc + precio * cantidad;
    }, 0);
    setTotal(suma);
  }, [venta]);

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data || []);
    } catch (err) {
      alert("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const buscarPorCodigo = async (id) => {
    if (!id || id.trim() === "") return;

    setBuscandoCodigo(true);
    try {
      const { data } = await api.get(`/caja/productos/id/${id.trim()}`);
      agregarProducto(data);
      setCodigoBusqueda("");
      if (inputCodigoRef.current) {
        inputCodigoRef.current.focus();
      }
    } catch (err) {
      console.error("Error buscando producto:", err);
      alert(err.response?.data?.error || "Producto no encontrado o sin stock");
      setCodigoBusqueda("");
      if (inputCodigoRef.current) {
        inputCodigoRef.current.focus();
      }
    } finally {
      setBuscandoCodigo(false);
    }
  };

  const handleCodigoKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarPorCodigo(codigoBusqueda);
    }
  };

  const agregarProducto = (producto) => {
    const precio = Number(producto.precioUnitario) || 0;
    
    if (precio <= 0) {
      alert(`El producto ${producto.nombre || 'este producto'} no tiene un precio válido`);
      return;
    }

    const itemEnVenta = venta.find((p) => p.id === producto.id);
    const cantidadEnVenta = itemEnVenta ? itemEnVenta.cantidad : 0;
    const stockDisponible = Number(producto.stock) || 0;
    
    if (stockDisponible > 0 && cantidadEnVenta >= stockDisponible) {
      alert(`No hay más stock disponible de ${producto.nombre}`);
      return;
    }

    const existe = venta.find((p) => p.id === producto.id);
    if (existe) {
      setVenta(
        venta.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        )
      );
    } else {
      setVenta([...venta, { ...producto, cantidad: 1 }]);
    }
  };

  const eliminarProducto = (id) => {
    setVenta(venta.filter((p) => p.id !== id));
  };

  const disminuirCantidad = (id) => {
    const producto = venta.find((p) => p.id === id);
    if (producto.cantidad === 1) {
      eliminarProducto(id);
    } else {
      setVenta(
        venta.map((p) =>
          p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p
        )
      );
    }
  };

  const handleCobrar = async () => {
    if (venta.length === 0) {
      alert("Agrega productos a la venta");
      return;
    }

    const usuarioId = sessionStorage.getItem("userId");
    
    if (!usuarioId) {
      alert("No se encontró el usuario. Inicia sesión de nuevo.");
      window.location.href = '/login';
      return;
    }

    const detalles = venta.map(item => ({
      productoId: item.id,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario
    }));

    setLoadingVenta(true);
    try {
      const ventaCreada = await createVenta({ 
        usuarioId: Number(usuarioId),
        detalles: detalles 
      });
      
      setUltimaVenta({
        numeroTransaccion: ventaCreada.numeroTransaccion,
        total: ventaCreada.total,
        fecha: new Date(ventaCreada.fecha)
      });

      setVenta([]);
      setTotal(0);
      
      await fetchProductos();
    } catch (err) {
      console.error("Error al registrar venta:", err);
      alert(err.response?.data?.error || "Error al registrar la venta. Intenta de nuevo.");
    } finally {
      setLoadingVenta(false);
    }
  };

  const cerrarModalVenta = () => {
    setUltimaVenta(null);
    if (inputCodigoRef.current) {
      inputCodigoRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Punto de venta</h1>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
               🔍 Buscar producto por ID
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputCodigoRef}
                  type="number"
                  value={codigoBusqueda}
                  onChange={(e) => setCodigoBusqueda(e.target.value)}
                  onKeyPress={handleCodigoKeyPress}
                  placeholder="Ingresa el ID del producto..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={buscandoCodigo}
                />
                <button
                  onClick={() => buscarPorCodigo(codigoBusqueda)}
                  disabled={buscandoCodigo || !codigoBusqueda.trim()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {buscandoCodigo ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                Productos disponibles
              </h2>
              
              {loading ? (
                <p className="text-gray-500">Cargando productos...</p>
              ) : productos.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  No hay productos disponibles. Agrega productos desde el módulo de productos.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productos.map((prod) => {
                    const precio = Number(prod.precioUnitario) || 0;
                    const stock = Number(prod.stock) || 0;
                    const sinStock = stock === 0;
                    const sinPrecio = precio === 0;

                    return (
                      <div
                        key={prod.id}
                        className={`bg-white p-4 rounded-lg shadow transition-all ${
                          sinStock || sinPrecio
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:shadow-lg cursor-pointer hover:bg-blue-50 hover:scale-105"
                        }`}
                        onClick={() => !sinStock && !sinPrecio && agregarProducto(prod)}
                      >
                        <h3 className="font-semibold text-lg mb-2">
                          {prod.nombre || "Sin nombre"}
                        </h3>
                        {prod.codigo && (
                          <p className="text-xs text-gray-500 mb-1">
                            Código: {prod.codigo}
                          </p>
                        )}
                        <p className={`font-bold ${sinPrecio ? "text-red-500" : "text-green-600"}`}>
                          ${precio.toLocaleString('es-CO')}
                          {sinPrecio && <span className="text-xs ml-1">(Sin precio)</span>}
                        </p>
                        <p className={`text-sm ${sinStock ? "text-red-500" : "text-gray-600"}`}>
                          Stock: {stock}
                          {sinStock && <span className="ml-1">(Agotado)</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="w-96">
            <div className="sticky top-6">
              <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h2 className="text-xl font-bold mb-4 text-gray-800">🛍️ Carrito</h2>
                {venta.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay productos agregados</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {venta.map((item) => {
                        const precio = Number(item.precioUnitario) || 0;
                        const cantidad = Number(item.cantidad) || 0;
                        const subtotal = precio * cantidad;

                        return (
                          <div key={item.id} className="border-b pb-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-sm flex-1">{item.nombre || "Producto"}</span>
                              <button
                                onClick={() => eliminarProducto(item.id)}
                                className="text-red-500 hover:text-red-700 text-xs ml-2"
                              >
                                🗑️
                              </button>
                            </div>
                            {item.codigo && (
                              <p className="text-xs text-gray-500 mb-2">Código: {item.codigo}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => disminuirCantidad(item.id)}
                                  className="bg-gray-200 text-gray-700 w-7 h-7 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center font-bold text-sm"
                                >
                                  −
                                </button>
                                <span className="font-medium w-6 text-center">{cantidad}</span>
                                <button
                                  onClick={() => agregarProducto(item)}
                                  className="bg-gray-200 text-gray-700 w-7 h-7 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center font-bold text-sm"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-semibold text-green-600">
                                ${subtotal.toLocaleString('es-CO')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 pt-4 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-800">TOTAL:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${total.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleCobrar}
                disabled={loadingVenta || venta.length === 0}
                className={`w-full py-4 rounded-lg font-bold text-white text-xl transition-colors ${
                  loadingVenta || venta.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loadingVenta ? "Procesando..." : "Cobrar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {ultimaVenta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-4xl">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
               </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Venta exitosa!</h3>
              <p className="text-gray-600 mb-6">La venta se ha registrado correctamente</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Número de transacción</p>
                  <p className="text-lg font-mono font-bold text-blue-600">
                    {ultimaVenta.numeroTransaccion}
                  </p>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${ultimaVenta.total.toLocaleString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha y hora</p>
                  <p className="font-semibold text-gray-700">
                    {ultimaVenta.fecha.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <button
                onClick={cerrarModalVenta}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Caja;