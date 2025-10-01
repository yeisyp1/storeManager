const express = require('express');
const router = express.Router();
const {getProductos, 
       crearProducto,
       actualizarProducto,
       eliminarProducto

} = require('../controllers/productoC');

const { autenticar, autorizar } = require('../middlewares/auth');


router.get('/', getProductos);
router.post('/', autenticar, autorizar (['Administrador']), crearProducto);
router.put('/:id', autenticar, autorizar (['Administrador']), actualizarProducto);
router.delete('/:id', autenticar, autorizar (['Administrador']), eliminarProducto);

module.exports = router;    