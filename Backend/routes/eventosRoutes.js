const express = require('express');
const router = express.Router();
const { verPermiso } = require('../middlewares/auth');
const eventoController = require('../controllers/eventoController');

router.get('/', verPermiso(['Administrador', 'Usuario']), eventoController.obtenerEventos);
router.post('/', verPermiso(['Administrador', 'Usuario']), eventoController.crearEvento);
router.delete('/:id', verPermiso(['Administrador', 'Usuario']), eventoController.eliminarEvento);

module.exports = router;