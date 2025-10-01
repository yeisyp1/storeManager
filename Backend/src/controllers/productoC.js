const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const getProductos = async (req, res) => {
    try 
    {
        const productos = await prisma.producto.findMany();
        res.json(productos);
    }

    catch (error) 
    {
        res.status(500).json({error: error.message});
    }
};

const crearProducto = async (req, res) => {
    const {nombre, descripcion, precioUnitario, stock} = req.body;
    try 
    {
        const nuevoProducto = await prisma.producto.create({
            data: 
            {nombre, descripcion, precioUnitario, stock}
        });
        res.status(201).json(nuevoProducto);
    }

    catch (error) 
    {
        res.status(500).json({error: error.message});
    }
};

module.exports = {getProductos, crearProducto};