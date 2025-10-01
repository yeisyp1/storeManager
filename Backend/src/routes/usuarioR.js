const express = require('express');
const router = express.Router();
const {getUsuarios, crearUsuario} = require('../controllers/usuarioC'); 
const { autenticar, autorizar } = require('../middlewares/auth');

router.get('/', getUsuarios);
router.post('/', autenticar, autorizar (['Administrador']), crearUsuario);

module.exports = router;