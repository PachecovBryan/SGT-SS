const express = require('express');
const router = express.Router();
const { verPermiso } = require('../middlewares/auth');
const personalController = require('../controllers/personalController');


router.get('/', verPermiso(['Administrador', 'Usuario']), personalController.obtenerPersonal);
router.get('/:id', verPermiso(['Administrador', 'Usuario']), personalController.obtenerPersonalPorID);
router.post('/', verPermiso(['Administrador']), personalController.crearPersonal);
router.put('/:id', verPermiso(['Administrador']), personalController.actualizarPersonal);
router.delete('/:id', verPermiso(['Administrador']), personalController.eliminarPersonal);

module.exports = router;