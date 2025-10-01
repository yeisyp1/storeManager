const express = require('express');
const router = express.Router();
const {getProductos, crearProducto} = require('../controllers/productoC');

router.get('/', getProductos);
router.post('/', crearProducto);

module.exports = router;    