const express = require('express');
const router = express.Router();
const { verPermiso } = require('../middlewares/auth');
const usuarioController = require('../controllers/usuarioController');

router.get('/', verPermiso(['Administrador']), usuarioController.obtenerUsuarios);
router.post('/', verPermiso(['Administrador']), usuarioController.crearUsuario);
router.put('/:id', verPermiso(['Administrador', 'Usuario']), usuarioController.actualizarUsuario);
router.delete('/:id', verPermiso(['Administrador']), usuarioController.eliminarUsuario);

module.exports = router;