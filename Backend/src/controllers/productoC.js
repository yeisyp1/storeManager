const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const getProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany();
    res.json(productos);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

const crearProducto = async (req, res) => {
  const {nombre, descripcion, precioUnitario, stock} = req.body;
  
  try {
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre, 
        descripcion: descripcion || null, 
        precioUnitario: parseFloat(precioUnitario), 
        stock: parseInt(stock)
      }
    });
    res.status(201).json(nuevoProducto);
  } 
  catch (error) 
  {
    console.error('Error creando producto:', error);
    res.status(500).json({error: error.message});
  }
};

const actualizarProducto = async (req, res) => {
  const {id} = req.params;
  const {nombre, descripcion, precioUnitario, stock} = req.body;
  
  try {
    const producto = await prisma.producto.update({
      where: {id: parseInt(id)},
      data: {
        nombre, 
        descripcion: descripcion || null, 
        precioUnitario: parseFloat(precioUnitario), 
        stock: parseInt(stock)
      }
    });
    res.json(producto);
  } 
  catch (error) 
  {
    res.status(500).json({error: error.message});
  }
};

const eliminarProducto = async (req, res) => {
  const {id} = req.params;
  
  try {
    await prisma.producto.delete({
      where: {id: parseInt(id)}
    });
    res.json({message: 'Producto eliminado'});
  } 
  catch (error) 
  {
    res.status(500).json({error: error.message});
  }
};

module.exports = {getProductos, crearProducto, actualizarProducto, eliminarProducto};