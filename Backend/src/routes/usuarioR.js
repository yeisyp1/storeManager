const express = require('express');
const router = express.Router();
const {getUsuarios, crearUsuario} = require('../controllers/usuarioC'); 

router.get('/', getUsuarios);
router.post('/', crearUsuario);

module.exports = router;