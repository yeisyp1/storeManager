const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ventasDiarias = async (req, res) => {
    try {

        const hoy = new Date();
        const fechaHoy = hoy.toISOString().split('T')[0]; 
        const fechaInicio = new Date(fechaHoy + 'T00:00:00.000Z');
        const fechaFin = new Date(fechaHoy + 'T23:59:59.999Z');

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
                }
            }
        });

       const totalVenta = venta.total ? parseFloat(venta.total.toString()) : 0;
       doc.fontSize(11).fillColor('#000')
       .text(`   TOTAL: $${totalVenta.toLocaleString('es-CO')}`, { align: 'right' });

       const ingresoTotal = ventas.reduce((sum, venta) => sum + (venta.total ? parseFloat(venta.total.toString()) : 0), 0);



        res.status(200).json({
            fecha: fechaHoy,
            totalVentas,
            ingresoTotal: ingresoTotal.toFixed(2),
            ventas
        });

    } catch (error) {
        console.error('Error al obtener ventas diarias:', error);
     
    }
};

const exportarPdf = async (req, res) => {
    try {
        const { fecha } = req.query; 

        let whereClause = {};
        
        if (fecha) {
            const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
            const fechaFin = new Date(fecha + 'T23:59:59.999Z');
            
            whereClause = {
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            };
        }

        const ventas = await prisma.venta.findMany({
            where: whereClause,
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
                error: 'No hay ventas para el período seleccionado'
            });
        }

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ReporteVentas.pdf');
        
        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Ventas', { align: 'center' });
        doc.moveDown();
        
        const fechaReporte = fecha || new Date().toISOString().split('T')[0];
        doc.fontSize(12).text(`Fecha: ${fechaReporte}`, { align: 'center' });
        doc.moveDown(2);

        const totalIngresos = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
        doc.fontSize(14).text(`Total de Ventas: ${ventas.length}`);
        doc.text(`Ingresos Totales: $${totalIngresos.toLocaleString('es-CO')}`);
        doc.moveDown(2);

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

            doc.fontSize(11).fillColor('#000')
               .text(`   TOTAL: $${parseFloat(venta.total.toString()).toLocaleString('es-CO')}`, { align: 'right' });
            
            doc.moveDown(1.5);

            if ((index + 1) % 10 === 0 && index < ventas.length - 1) {
                doc.addPage();
            }
        });

        doc.fontSize(8).fillColor('#999')
           .text(`Generado el ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`, 50, doc.page.height - 50, {
               align: 'center'
           });

        doc.end();

    } catch (error) {
        console.error('Error al exportar PDF:', error);
        
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error al generar el PDF' });
        }
    }
};
module.exports = { ventasDiarias, exportarPdf };