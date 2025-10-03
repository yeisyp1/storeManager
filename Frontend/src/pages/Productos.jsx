import React, { useEffect, useState } from "react";
import { getProductos, createProducto, updateProducto, deleteProducto } from "../api/api";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", precioUnitario: "", stock: "" });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        precioUnitario: parseFloat(formData.precioUnitario),
        stock: parseInt(formData.stock)
      };

      if (editId) {
        await updateProducto(editId, data);
        alert("Producto actualizado correctamente");
      } else {
        await createProducto(data);
        alert("Producto creado correctamente");
      }
      
      setFormData({ nombre: "", descripcion: "", precioUnitario: "", stock: "" });
      setEditId(null);
      fetchProductos();
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError(err.response?.data?.error || "Error al guardar el producto");
    }
  };

  const handleEdit = (producto) => {
    setFormData({ 
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precioUnitario: producto.precioUnitario.toString(), 
      stock: producto.stock.toString() 
    });
    setEditId(producto.id);
  };

  const handleCancelEdit = () => {
    setFormData({ nombre: "", descripcion: "", precioUnitario: "", stock: "" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    
    try {
      await deleteProducto(id);
      alert("Producto eliminado correctamente");
      fetchProductos();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      alert(err.response?.data?.error || "Error al eliminar el producto");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Gestión de productos</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Precio"
              value={formData.precioUnitario}
              onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
              required
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              min="0"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {editId ? "Actualizar producto" : "Agregar producto"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <p className="p-4">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="p-4">No hay productos registrados.</p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Descripción</th>
                  <th className="p-3 text-left">Precio</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => (
                  <tr key={prod.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{prod.nombre}</td>
                    <td className="p-3 text-gray-600">{prod.descripcion || '-'}</td>
                    <td className="p-3">${Number(prod.precioUnitario).toLocaleString('es-CO')}</td>
                    <td className="p-3">{prod.stock}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Productos;