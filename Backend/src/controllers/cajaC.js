const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generarNumeroTransaccion = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  const seconds = String(fecha.getSeconds()).padStart(2, '0');
  const ms = String(fecha.getMilliseconds()).padStart(3, '0');
  
  return `TXN-${year}${month}${day}-${hours}${minutes}${seconds}-${ms}`;
};

const crearVenta = async (req, res) => {

  const { usuarioId, detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
  }

  let total = 0;
  const detallesSub = detalles.map(detalle => {
    const subtotal = detalle.cantidad * detalle.precioUnitario;
    total += subtotal;
    return {
      precioUnitario: detalle.precioUnitario,
      cantidad: detalle.cantidad,
      subtotal: subtotal,
      productoId: detalle.productoId
    };
  });

  try {
    const numeroTransaccion = generarNumeroTransaccion();

    for (let detalle of detalles) {
      const producto = await prisma.producto.findUnique({
        where: { id: detalle.productoId }
      });

      if (!producto) {
        return res.status(404).json({ 
          error: `Producto con ID ${detalle.productoId} no encontrado` 
        });
      }

      if (producto.stock < detalle.cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${detalle.cantidad}` 
        });
      }
    }

    const venta = await prisma.venta.create({
      data: {
        usuarioId,
        total,
        numeroTransaccion,
        detalles: { create: detallesSub }
      },
      include: { 
        detalles: {
          include: {
            producto: true
          }
        },
        usuario: true
      }
    });

    for (let detalle of detalles) {
      await prisma.producto.update({
        where: { id: detalle.productoId },
        data: { stock: { decrement: detalle.cantidad } }
      });
    }

    res.status(201).json(venta);
  } 
  catch (error) 
  {
    res.status(500).json({ error: 'Error al crear la venta' });
  }
};

const obtenerVentas = async (req, res) => {

  try {
    const ventas = await prisma.venta.findMany({
      include: { 
        detalles: {
          include: {
            producto: true
          }
        }, 
        usuario: true 
      },
      orderBy: {
        fecha: 'desc'
      }
    });
    res.json(ventas);
  } 
  catch (error) 
  {
    
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

const buscarProductoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (producto.stock === 0) {
      return res.status(400).json({ error: 'Producto sin stock disponible' });
    }

    res.json(producto);
  } 
  catch (error) 
  {
    res.status(500).json({ error: 'Error al buscar producto' });
  }
};

module.exports = { crearVenta, obtenerVentas, buscarProductoPorId };