const express = require('express');
const router = express.Router();
const {ventasDiarias, exportarPdf} = require('../controllers/reportesC');   
const { autenticar, autorizar } = require('../middlewares/auth');

router.get('/ventas-diarias', autenticar, autorizar(['Administrador']), ventasDiarias);
router.get('/exportar-pdf', exportarPdf);

module.exports = router;