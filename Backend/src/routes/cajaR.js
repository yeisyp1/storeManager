const express = require('express');
const router = express.Router();
const { crearVenta, obtenerVentas } = require('../controllers/cajaC');
const { autenticar, autorizar } = require('../middlewares/auth');

router.post('/ventas', autenticar, crearVenta);

router.get('/ventas', autenticar, autorizar(['Administrador']), obtenerVentas);

module.exports = router;
