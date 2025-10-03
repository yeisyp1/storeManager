const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerRangoFechaUTC = (fechaLocal) => {
    if (!fechaLocal) {

        const ahora = new Date();
        const fechaColombia = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
        const year = fechaColombia.getFullYear();
        const month = String(fechaColombia.getMonth() + 1).padStart(2, '0');
        const day = String(fechaColombia.getDate()).padStart(2, '0');
        fechaLocal = `${year}-${month}-${day}`;
    }

    const fechaInicio = new Date(`${fechaLocal}T00:00:00.000-05:00`);
    const fechaFin = new Date(`${fechaLocal}T23:59:59.999-05:00`);
    
    return { fechaInicio, fechaFin, fechaLocal };
};

const ventasDiarias = async (req, res) => {
    try {
        const { fecha } = req.query;
        
        const { fechaInicio, fechaFin, fechaLocal } = obtenerRangoFechaUTC(fecha);

        const ventas = await prisma.venta.findMany({
            where: {
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            },
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

        if (ventas.length > 0) {
            console.log('Primera venta:', ventas[0].fecha);
        }

        const totalVentas = ventas.length;
        const ingresoTotal = ventas.reduce((sum, venta) => {
            return sum + (venta.total ? parseFloat(venta.total.toString()) : 0);
        }, 0);

        const productosVendidos = {};
        ventas.forEach(venta => {
            venta.detalles.forEach(detalle => {
                const productoId = detalle.productoId;
                const nombreProducto = detalle.producto?.nombre || 'Desconocido';
                
                if (!productosVendidos[productoId]) {
                    productosVendidos[productoId] = {
                        nombre: nombreProducto,
                        cantidad: 0,
                        ingresos: 0
                    };
                }
                
                productosVendidos[productoId].cantidad += detalle.cantidad;
                productosVendidos[productoId].ingresos += parseFloat(detalle.subtotal.toString());
            });
        });

        res.status(200).json({
            fecha: fechaLocal,
            totalVentas,
            ingresoTotal: parseFloat(ingresoTotal.toFixed(2)),
            productosVendidos: Object.values(productosVendidos),
            ventas
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ventas diarias' });
    }
};

const exportarPdf = async (req, res) => {
    try {
        const { fecha } = req.query;

        const { fechaInicio, fechaFin, fechaLocal } = obtenerRangoFechaUTC(fecha);

        const ventas = await prisma.venta.findMany({
            where: {
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            },
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

        if (ventas.length === 0) {
            return res.status(404).json({ 
                error: 'No hay ventas para el rango seleccionado'
            });
        }

        const totalVentas = ventas.length;
        const ingresoTotal = ventas.reduce((sum, v) => sum + parseFloat(v.total.toString()), 0);
        
        const productosVendidos = {};
        ventas.forEach(venta => {
            venta.detalles.forEach(detalle => {
                const productoId = detalle.productoId;
                const nombreProducto = detalle.producto?.nombre || 'Desconocido';
                
                if (!productosVendidos[productoId]) {
                    productosVendidos[productoId] = {
                        nombre: nombreProducto,
                        cantidad: 0
                    };
                }
                
                productosVendidos[productoId].cantidad += detalle.cantidad;
            });
        });

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ReporteVentas.pdf');
        
        doc.pipe(res);

        doc.fontSize(20).fillColor('#000').text('REPORTE DE VENTAS', { align: 'center' });
        doc.moveDown();
        
        doc.fontSize(12).text(`Fecha: ${fechaLocal}`, { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(14).fillColor('#000').text('RESUMEN GENERAL', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Total de transacciones: ${totalVentas}`);
        doc.text(`Ingresos totales: $${ingresoTotal.toLocaleString('es-CO')}`);
        doc.moveDown(1.5);

        doc.text('');

        doc.fontSize(14).fillColor('#000').text('DETALLE DE VENTAS');
        doc.moveDown(1);

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        ventas.forEach((venta, index) => {
            doc.fontSize(12).fillColor('#000')
               .text(`Venta #${venta.id}`, { continued: true })
               .text(` - ${new Date(venta.fecha).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`, { align: 'right' });
            
            if (venta.usuario) {
                const nombreCajero = venta.usuario.nombre || venta.usuario.username || 'No especificado';
                doc.fontSize(10).fillColor('#666')
                   .text(`Cajero: ${nombreCajero}`);
            }
            
            doc.moveDown(0.5);

            venta.detalles.forEach((detalle) => {
                const subtotal = detalle.subtotal ? parseFloat(detalle.subtotal.toString()) : 0;
                const precioUnitario = detalle.cantidad ? subtotal / detalle.cantidad : 0;
                
                doc.fontSize(10).fillColor('#333')
                   .text(`   • ${detalle.producto?.nombre || 'Producto desconocido'}`, { continued: true })
                   .text(` | Cant: ${detalle.cantidad} | $${precioUnitario.toLocaleString('es-CO')} c/u | Subtotal: $${subtotal.toLocaleString('es-CO')}`);
            });

            const totalVenta = venta.total ? parseFloat(venta.total.toString()) : 0;
            doc.fontSize(11).fillColor('#000')
               .text(`   TOTAL: $${totalVenta.toLocaleString('es-CO')}`, { align: 'right' });
            
            doc.moveDown(1.5);

            if ((index + 1) % 8 === 0 && index < ventas.length - 1) {
                doc.addPage();
            }
        });

        doc.fontSize(8).fillColor('#999')
           .text(`Generado el ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`, 50, doc.page.height - 50, {
               align: 'center'
           });

        doc.end();

    } 
    catch (error) 
    {        
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error al generar PDF' });
        }
    }
};

module.exports = { ventasDiarias, exportarPdf };