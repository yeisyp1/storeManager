const express = require('express');
const router = express.Router();
const {getUsuarios, getUsuarioById, crearUsuario, actualizarUsuario, eliminarUsuario} = require('../controllers/usuarioC'); 
const { autenticar, autorizar } = require('../middlewares/auth');

router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', autenticar, autorizar (['Administrador']), crearUsuario);
router.put('/:id', autenticar, autorizar(['Administrador']), actualizarUsuario);
router.delete('/:id', autenticar, autorizar(['Administrador']), eliminarUsuario);

module.exports = router;