const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const crearVenta = async(req, res) => {
    const {usuarioId, detalles} = req.body;

    let total = 0;
    const detallesSub = detalles.map(detalle => {
        const subtotal = detalle.cantidad * detalle.precioUnitario;
        total += subtotal;
        return {
            cantidad: detalle.cantidad,
            subtotal: subtotal,
            productoId: detalle.productoId
        };
    });

    try {
    const venta = await prisma.venta.create({
        data: 
        {
            usuarioId,
            total,
            detalles: {create: detallesSub}
        },

        include: {detalles: true}
    });

    for (let detalle of detalles) {
        await prisma.producto.update(
        {
            where: {id: detalle.productoId},
            data: {stock: {decrement: detalle.cantidad}}
        });
    }
    
     res.status(201).json(venta);


    } catch (error) {
        res.status(500).json({error: 'Error al crear la venta'});
    }    
};

    

const obtenerVentas = async(req, res) => {
    try 
    {
        const ventas = await prisma.venta.findMany({
            include: {detalles: true, usuario: true}
        });
        res.json(ventas);
    } 
    catch (error) 
    {
        res.status(500).json({error: 'Error al obtener las ventas'});
    }
   
 };

module.exports = {crearVenta, obtenerVentas};